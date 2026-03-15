from pathlib import Path
from datetime import date
from typing import List, Optional
import hashlib

import joblib
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.db_models import SessionLocal, User, Prediction, init_db
from backend.utils_save import save_prediction_and_report
from backend.report_utils import REPORTS_DIR

# ----------------- FastAPI + CORS -----------------

BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / "models"

app = FastAPI(title="SuSwastha API")

# Allow GitHub Pages + local dev
cors_origins = [
    "https://biprajit2313.github.io",
    "https://biprajit2313.github.io/SuSwastha",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def startup():
    init_db()


# ----------------- Prediction Input Models -----------------

class DiabetesInput(BaseModel):
    email: str
    glucose: float
    blood_pressure: float
    skin_thickness: float
    bmi: float
    age: float
    insulin: float
    pedigree: float


class CholesterolInput(BaseModel):
    total_cholesterol: float
    hdl: float
    ldl: float
    triglycerides: float
    age: float
    bmi: float
    blood_pressure: float
    smoking_status: int
    family_history: int
    email: str


class KidneyInput(BaseModel):
    age: float
    blood_pressure: float
    specific_gravity: float
    albumin: float
    sugar: float
    blood_glucose_random: float
    blood_urea: float
    serum_creatinine: float
    sodium: float
    potassium: float
    hemoglobin: float
    packed_cell_volume: float
    white_blood_cell_count: float
    red_blood_cell_count: float
    email: str


class LiverInput(BaseModel):
    age: float
    gender: int
    total_bilirubin: float
    direct_bilirubin: float
    alkaline_phosphatase: float
    alt: float
    ast: float
    total_proteins: float
    albumin: float
    ag_ratio: float
    email: str


class HeartInput(BaseModel):
    age: float
    sex: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalach: float
    exang: int
    oldpeak: float
    slope: int
    ca: float
    thal: int
    email: str


class BloodPressureInput(BaseModel):
    systolic: float
    diastolic: float
    age: float
    weight: float
    height: float
    stress_level: int
    activity_level: int
    email: str


class ThyroidInput(BaseModel):
    age: float
    sex: int
    tsh: float
    t3: float
    t4: float
    free_t4_index: float
    free_t3_index: float
    medication_status: int
    pregnancy_status: int
    goitre_status: int
    email: str


class GenericOutput(BaseModel):
    label: str
    risk_score: float
    pdf_url: str


def load_model(name: str):
    path = MODELS_DIR / f"{name}.joblib"
    if not path.exists():
        raise HTTPException(status_code=500, detail=f"Model {name} not found at {path}")
    return joblib.load(path)


# ----------------- Prediction Endpoints -----------------

@app.post("/api/predict/diabetes", response_model=GenericOutput)
def predict_diabetes(payload: DiabetesInput):
    model = load_model("diabetes")
    X = [[payload.glucose, payload.blood_pressure, payload.skin_thickness, payload.insulin, payload.bmi, payload.pedigree, payload.age]]
    prob = float(model.predict_proba(X)[0][1])
    return save_prediction_and_report("diabetes", payload.email, payload.model_dump(), prob)


@app.post("/api/predict/cholesterol", response_model=GenericOutput)
def predict_cholesterol(payload: CholesterolInput):
    model = load_model("cholesterol")
    X = [[payload.total_cholesterol, payload.hdl, payload.ldl, payload.triglycerides, payload.age, payload.bmi, payload.blood_pressure, payload.smoking_status, payload.family_history]]
    prob = float(model.predict_proba(X)[0][1])
    return save_prediction_and_report("cholesterol", payload.email, payload.model_dump(), prob)


@app.post("/api/predict/kidney", response_model=GenericOutput)
def predict_kidney(payload: KidneyInput):
    model = load_model("kidney")
    X = [[payload.age, payload.blood_pressure, payload.specific_gravity, payload.albumin, payload.sugar, payload.blood_glucose_random, payload.blood_urea, payload.serum_creatinine, payload.sodium, payload.potassium, payload.hemoglobin, payload.packed_cell_volume, payload.white_blood_cell_count, payload.red_blood_cell_count]]
    prob = float(model.predict_proba(X)[0][1])
    return save_prediction_and_report("kidney", payload.email, payload.model_dump(), prob)


@app.post("/api/predict/liver", response_model=GenericOutput)
def predict_liver(payload: LiverInput):
    model = load_model("liver")
    X = [[payload.age, payload.gender, payload.total_bilirubin, payload.direct_bilirubin, payload.alkaline_phosphatase, payload.alt, payload.ast, payload.total_proteins, payload.albumin, payload.ag_ratio]]
    prob = float(model.predict_proba(X)[0][1])
    return save_prediction_and_report("liver", payload.email, payload.model_dump(), prob)


@app.post("/api/predict/heart", response_model=GenericOutput)
def predict_heart(payload: HeartInput):
    model = load_model("heart")
    X = [[payload.age, payload.sex, payload.cp, payload.trestbps, payload.chol, payload.fbs, payload.restecg, payload.thalach, payload.exang, payload.oldpeak, payload.slope, payload.ca, payload.thal]]
    prob = float(model.predict_proba(X)[0][1])
    return save_prediction_and_report("heart", payload.email, payload.model_dump(), prob)


@app.post("/api/predict/blood_pressure", response_model=GenericOutput)
def predict_blood_pressure(payload: BloodPressureInput):
    model = load_model("blood_pressure")
    X = [[payload.systolic, payload.diastolic, payload.age, payload.weight, payload.height, payload.stress_level, payload.activity_level]]
    prob = float(model.predict_proba(X)[0][1])
    return save_prediction_and_report("blood_pressure", payload.email, payload.model_dump(), prob)


@app.post("/api/predict/thyroid", response_model=GenericOutput)
def predict_thyroid(payload: ThyroidInput):
    model = load_model("thyroid")
    X = [[payload.age, payload.sex, payload.tsh, payload.t3, payload.t4, payload.free_t4_index, payload.free_t3_index, payload.medication_status, payload.pregnancy_status, payload.goitre_status]]
    prob = float(model.predict_proba(X)[0][1])
    return save_prediction_and_report("thyroid", payload.email, payload.model_dump(), prob)


# ----------------- Auth -----------------

class SignupPayload(BaseModel):
    name: str
    email: str
    password: str
    dob: Optional[date] = None


class LoginPayload(BaseModel):
    email: str
    password: str


def hash_password(raw: str) -> str:
    if not raw or not raw.strip():
        raise HTTPException(status_code=400, detail="Password is required")
    return hashlib.sha256(raw.strip().encode("utf-8")).hexdigest()


@app.post("/api/signup")
def signup(payload: SignupPayload, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        dob=payload.dob,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Signup successful"}


@app.post("/api/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.password_hash != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful"}


# ----------------- User reports -----------------

class UserReportOut(BaseModel):
    test_type: str
    label: str
    risk_score: Optional[float] = None
    created_at: str
    pdf_url: Optional[str] = None

    class Config:
        from_attributes = True


@app.get("/api/user/reports", response_model=List[UserReportOut])
def user_reports(email: str, db: Session = Depends(get_db)):
    rows = (
        db.query(Prediction)
        .filter(Prediction.user_email == email)
        .order_by(Prediction.created_at.desc())
        .limit(20)
        .all()
    )
    out = []
    for r in rows:
        out.append(
            UserReportOut(
                test_type=r.test_type,
                label=r.label,
                risk_score=r.risk_score,
                created_at=r.created_at.strftime("%Y-%m-%d %H:%M"),
                pdf_url=r.pdf_path,
            )
        )
    return out


# ----------------- Serve PDFs -----------------

app.mount("/reports", StaticFiles(directory=str(REPORTS_DIR)), name="reports")
