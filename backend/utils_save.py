import json
from pathlib import Path
from typing import Dict

from db_models import SessionLocal, User, Prediction
from report_utils import generate_pdf_report, send_report_email


def save_prediction_and_report(
    test_type: str,
    email: str,
    inputs: Dict,
    prob: float,
    threshold: float = 0.5,
):
    """
    Common helper used by all /api/predict/... endpoints.

    1. Convert probability to risk %
    2. Decide label (High / Low risk)
    3. Generate PDF report
    4. Save prediction row in MySQL
    5. Email the PDF to the user (non-fatal if it fails)
    6. Return data for API response (label, risk_score, pdf_url)
    """

    # 1) Probability -> percentage + label
    risk_percent = prob * 100.0
    label = "High Risk" if prob >= threshold else "Low Risk"

    # 2) Generate PDF report file
    pdf_path = generate_pdf_report(
        user_email=email,
        test_type=test_type,
        inputs=inputs,
        label=label,
        risk_score=risk_percent,
    )

    # 3) Save row in DB
    session = SessionLocal()
    try:
        # ensure user exists
        user = session.query(User).filter_by(email=email).first()
        if not user:
            user = User(email=email, name=email.split("@")[0])
            session.add(user)
            session.flush()  # get user.id if needed

        pred = Prediction(
            user_email=email,
            test_type=test_type,
            raw_input=json.dumps(inputs),
            label=label,
            risk_score=risk_percent,
            pdf_path=str(pdf_path),
        )
        session.add(pred)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

    # 4) Try to email the PDF to the user
    # (if SMTP config is wrong, we just log and still return success)
    try:
        send_report_email(
            to_email=email,
            pdf_path=pdf_path,
            subject=f"{test_type.title()} report from SuSwastha",
        )
    except Exception as e:
        print("Failed to send report email:", e)

    # 5) Data returned to FastAPI endpoint
    return {
        "label": label,
        "risk_score": risk_percent,
        "pdf_url": f"/reports/{Path(pdf_path).name}",
    }

