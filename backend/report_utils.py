from pathlib import Path
from datetime import datetime
import os

import smtplib
from email.message import EmailMessage

# Folder where all PDFs will be stored (relative to this file)
BASE_DIR = Path(__file__).parent
REPORTS_DIR = BASE_DIR / "generated_reports"
REPORTS_DIR.mkdir(exist_ok=True)


def generate_pdf_report(
    user_email: str,
    test_type: str,
    inputs: dict,
    label: str,
    risk_score: float,
) -> str:
    # Lazy import so the API can still start even if reportlab isn't installed yet.
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_email = user_email.replace("@", "_at_").replace(".", "_")
    filename = f"{safe_email}_{test_type}_{ts}.pdf"
    path = REPORTS_DIR / filename

    c = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4

    y = height - 50
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, f"SuSwastha {test_type.title()} Report")

    y -= 40
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"User: {user_email}")
    y -= 20
    c.drawString(50, y, f"Generated: {datetime.utcnow().isoformat()}")

    y -= 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Prediction Summary:")

    y -= 20
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Label: {label}")
    y -= 20
    c.drawString(50, y, f"Risk Score: {risk_score:.1f}%")

    y -= 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Inputs:")
    y -= 20
    c.setFont("Helvetica", 11)

    for k, v in inputs.items():
        if y < 80:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 11)
        c.drawString(60, y, f"- {k}: {v}")
        y -= 18

    if y < 80:
        c.showPage()
        y = height - 50

    c.setFont("Helvetica", 10)
    c.drawString(
        50,
        y,
        "Educational risk estimate only. Not a diagnosis. Please consult a clinician.",
    )

    c.showPage()
    c.save()
    return str(path)


# ---------- Email configuration ----------

# Values can be provided via environment variables in deployment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")


def send_report_email(
    to_email: str,
    pdf_path: str,
    subject: str = "SuSwastha Health Report",
):
    """
    Send the generated PDF report as an email attachment to the user.
    """
    # If SMTP isn't configured, skip emailing (prediction should still succeed).
    if not SMTP_USER or not SMTP_PASS:
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg.set_content(
        "Please find your SuSwastha health report attached as a PDF.\n\n"
        "This is an automated message from the SuSwastha system."
    )

    pdf_file = Path(pdf_path)
    with pdf_file.open("rb") as f:
        pdf_data = f.read()

    msg.add_attachment(
        pdf_data,
        maintype="application",
        subtype="pdf",
        filename=pdf_file.name,
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

