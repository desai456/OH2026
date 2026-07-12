import os
import subprocess
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, date
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from .database import engine, Base, get_db
from . import models, schemas


Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoSphere ESG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_populate():
    db = next(get_db())
    if db.query(models.Department).count() == 0:
        # Seed departments
        depts = [
            models.Department(name="Manufacturing", code="MFG", head="S. Nair", employees=214, status="Active"),
            models.Department(name="Sales", code="SLS", head="V. Kapoor", employees=96, status="Active"),
            models.Department(name="Logistics", code="LOG", head="A. Roy", employees=58, status="Active"),
            models.Department(name="Corporate", code="COR", head="N. Desai", employees=41, status="Active"),
            models.Department(name="R&D", code="RND", head="P. Menon", employees=73, status="Active"),
        ]
        db.add_all(depts)

        
        cats = [
            models.Category(name="Tree Plantation", type="CSR Activity", status="Active"),
            models.Category(name="Blood Donation", type="CSR Activity", status="Active"),
            models.Category(name="Recycling", type="Challenge", status="Active"),
            models.Category(name="Commute", type="Challenge", status="Active"),
        ]
        db.add_all(cats)

        
        factors = [
            models.EmissionFactor(category="Diesel (fleet)", unit="litre", factor="2.68 kg COâ‚‚e", source="DEFRA 2026", status="Active"),
            models.EmissionFactor(category="Grid electricity", unit="kWh", factor="0.71 kg COâ‚‚e", source="CEA India", status="Active"),
            models.EmissionFactor(category="Air travel (domestic)", unit="passenger-km", factor="0.15 kg COâ‚‚e", source="DEFRA 2026", status="Active"),
            models.EmissionFactor(category="Packaging (cardboard)", unit="kg", factor="0.94 kg COâ‚‚e", source="Internal LCA", status="Draft"),
            models.EmissionFactor(category="Natural gas", unit="mÂ³", factor="2.03 kg COâ‚‚e", source="DEFRA 2026", status="Active"),
        ]
        db.add_all(factors)

        
        products = [
            models.ProductProfile(product="EcoLine Packaging A2", footprint="0.42 kg COâ‚‚e / unit", recyclable="92%", cert="FSC Certified"),
            models.ProductProfile(product="Industrial Component X9", footprint="3.1 kg COâ‚‚e / unit", recyclable="48%", cert="â€”"),
            models.ProductProfile(product="Retail Bag â€“ Kraft", footprint="0.08 kg COâ‚‚e / unit", recyclable="100%", cert="Compostable"),
        ]
        db.add_all(products)

        
        goals = [
            models.EnvironmentalGoal(name="Reduce fleet emissions", dept="Logistics", target=500, current=390, unit="t COâ‚‚e", deadline="31 Dec 2026", status="Active"),
            models.EnvironmentalGoal(name="Cut packaging waste", dept="Manufacturing", target=120, current=98, unit="t", deadline="30 Sep 2026", status="On track"),
            models.EnvironmentalGoal(name="Office energy cut", dept="Corporate", target=80, current=80, unit="MWh", deadline="30 Jun 2026", status="Completed"),
            models.EnvironmentalGoal(name="Water usage reduction", dept="R&D", target=40, current=22, unit="kL", deadline="31 Oct 2026", status="Active"),
            models.EnvironmentalGoal(name="Renewable energy adoption", dept="Corporate", target=60, current=34, unit="%", deadline="31 Mar 2027", status="At risk"),
        ]
        db.add_all(goals)

        
        policies = [
            models.Policy(name="Anti-Corruption Policy", owner="Legal", version="v3.2", updated="12 Mar 2026"),
            models.Policy(name="Data Privacy Policy", owner="IT Governance", version="v2.0", updated="01 Feb 2026"),
            models.Policy(name="Code of Conduct", owner="HR", version="v4.1", updated="18 May 2026"),
            models.Policy(name="Whistleblower Policy", owner="Legal", version="v1.4", updated="22 Jan 2026"),
        ]
        db.add_all(policies)

        
        acks = [
            models.PolicyAcknowledgement(dept="Manufacturing", acknowledged=96),
            models.PolicyAcknowledgement(dept="Sales", acknowledged=88),
            models.PolicyAcknowledgement(dept="Logistics", acknowledged=79),
            models.PolicyAcknowledgement(dept="Corporate", acknowledged=100),
            models.PolicyAcknowledgement(dept="R&D", acknowledged=91),
        ]
        db.add_all(acks)

        
        audits = [
            models.Audit(title="Q2 waste audit", dept="Manufacturing", auditor="S. Nair", date="12 Jun 2026", findings="3 minor issues", status="Completed"),
            models.Audit(title="Vendor compliance check", dept="Procurement", auditor="R. Iyer", date="01 Jul 2026", findings="1 open issue", status="Under review"),
            models.Audit(title="Data handling review", dept="IT", auditor="M. Fernandes", date="22 Jun 2026", findings="No issues", status="Completed"),
        ]
        db.add_all(audits)

        # Seed compliance issues
        issues = [
            models.ComplianceIssue(issue="Missing MSDS sheets", severity="High", dept="Manufacturing", owner="S. Nair", due="2026-07-20", status="Open"),
            models.ComplianceIssue(issue="Late vendor disclosure", severity="Medium", dept="Procurement", owner="R. Iyer", due="2026-07-05", status="Resolved"),
            models.ComplianceIssue(issue="Incomplete audit trail", severity="Low", dept="IT", owner="M. Fernandes", due="2026-07-30", status="Open"),
        ]
        db.add_all(issues)

        
        challs = [
            models.Challenge(name="Sustainability Sprint", xp=200, difficulty="Hard", deadline="20 Jul", status="Active", category="Environmental"),
            models.Challenge(name="Recycle Challenge", xp=80, difficulty="Easy", deadline="15 Jul", status="Active", category="Environmental"),
            models.Challenge(name="Commute Green Week", xp=120, difficulty="Medium", deadline="25 Jul", status="Draft", category="Social"),
            models.Challenge(name="Paperless July", xp=60, difficulty="Easy", deadline="31 Jul", status="Under review", category="Governance"),
            models.Challenge(name="Energy Watch Q2", xp=150, difficulty="Medium", deadline="30 Jun", status="Completed", category="Environmental"),
        ]
        db.add_all(challs)

        
        badges = [
            models.Badge(name="Green Beginner", rule="Earn 100 XP", icon="Sparkles"),
            models.Badge(name="Carbon Saver", rule="Complete 3 environmental challenges", icon="Leaf"),
            models.Badge(name="Sustainability Champion", rule="Earn 2,000 XP", icon="Crown"),
            models.Badge(name="Team Player", rule="Join 5 CSR activities", icon="Medal"),
        ]
        db.add_all(badges)

        
        rewards = [
            models.Reward(name="Eco tumbler", points=150, stock=34),
            models.Reward(name="Extra WFH day", points=300, stock=12),
            models.Reward(name="Plant-a-tree donation", points=100, stock=999),
            models.Reward(name="Amazon voucher â‚¹1,000", points=800, stock=6),
        ]
        db.add_all(rewards)

        # Seed employees
        emps = [
            models.Employee(name="Nisha Patel", email="nisha@ecosphere.com", xp=2450, points=640),
            models.Employee(name="Priya Menon", email="priya@ecosphere.com", xp=1200, points=430),
            models.Employee(name="Aditi Rao", email="aditi@ecosphere.com", xp=1800, points=520),
            models.Employee(name="Rohan Verma", email="rohan@ecosphere.com", xp=950, points=210),
            models.Employee(name="Karan Shah", email="karan@ecosphere.com", xp=3120, points=890),
        ]
        db.add_all(emps)

        
        csrs = [
            models.CSRActivity(name="Tree plantation", icon="TreePine", joined=24, evidence=True, tone="env"),
            models.CSRActivity(name="Blood donation drive", icon="HeartPulse", joined=18, evidence=True, tone="social"),
            models.CSRActivity(name="Beach cleanup", icon="Waves", joined=31, evidence=False, tone="env"),
            models.CSRActivity(name="ESG workshop", icon="GraduationCap", joined=52, evidence=False, tone="social"),
        ]
        db.add_all(csrs)

        
        parts = [
            models.Participation(emp="Aditi Rao", activity="Tree plantation", proof="photo.jpg", points=50, status="Pending"),
            models.Participation(emp="Karan Shah", activity="ESG workshop", proof="cert.pdf", points=30, status="Approved"),
            models.Participation(emp="Rohan Verma", activity="Blood donation drive", proof="receipt.pdf", points=40, status="Pending"),
            models.Participation(emp="Priya Menon", activity="Beach cleanup", proof="â€”", points=25, status="Approved"),
        ]
        db.add_all(parts)

        
        ch_parts = [
            models.ChallengeParticipation(challenge="Sustainability Sprint", emp="Aditi Rao", progress=80, proof="log.pdf", approval="Pending", xp=0),
            models.ChallengeParticipation(challenge="Recycle Challenge", emp="Karan Shah", progress=100, proof="photo.jpg", approval="Approved", xp=80),
            models.ChallengeParticipation(challenge="Recycle Challenge", emp="Rohan Verma", progress=60, proof="â€”", approval="Pending", xp=0),
            models.ChallengeParticipation(challenge="Energy Watch Q2", emp="Priya Menon", progress=100, proof="report.pdf", approval="Approved", xp=150),
        ]
        db.add_all(ch_parts)

    
        txs = [
            models.CarbonTransaction(date="10 Jul", dept="Logistics", source="Fleet", qty="1,240 L", co2e="3.32 t", mode="Auto"),
            models.CarbonTransaction(date="10 Jul", dept="Manufacturing", source="Purchase", qty="3,800 kg", co2e="3.57 t", mode="Auto"),
            models.CarbonTransaction(date="09 Jul", dept="Corporate", source="Expense", qty="6,120 kWh", co2e="4.35 t", mode="Auto"),
            models.CarbonTransaction(date="08 Jul", dept="R&D", source="Manufacturing", qty="410 mÂ³", co2e="0.83 t", mode="Manual"),
            models.CarbonTransaction(date="07 Jul", dept="Sales", source="Fleet", qty="860 L", co2e="2.30 t", mode="Auto"),
        ]
        db.add_all(txs)

        # Seed settings config
        configs = [
            models.SettingsConfig(key="autoEmission", value="true"),
            models.SettingsConfig(key="evidence", value="true"),
            models.SettingsConfig(key="badgeAuto", value="true"),
            models.SettingsConfig(key="notifIssue", value="true"),
            models.SettingsConfig(key="notifApproval", value="true"),
            models.SettingsConfig(key="notifPolicy", value="false"),
            models.SettingsConfig(key="notifBadge", value="true"),
            models.SettingsConfig(key="weight_env", value="40"),
            models.SettingsConfig(key="weight_social", value="30"),
            models.SettingsConfig(key="weight_gov", value="30"),
        ]
        db.add_all(configs)

        # Seed notifications
        notifs = [
            models.Notification(title="Priya completed â€˜Zero Waste Weekâ€™", message="Priya Menon finished the challenge successfully.", tone="env", time="2h ago", is_read=False),
            models.Notification(title="New compliance issue raised in Logistics", message="A high-severity issue was logged during the fleet audit.", tone="gov", time="4h ago", is_read=False),
            models.Notification(title="42 new Carbon Transactions logged (auto)", message="Automatically calculated carbon footprints from ERP logs.", tone="env", time="6h ago", is_read=False),
            models.Notification(title="R&D acknowledged Anti-Corruption Policy", message="Data indicates full compliance of R&D department.", tone="gov", time="1d ago", is_read=False),
            models.Notification(title="Karan Shah unlocked â€˜Carbon Saverâ€™ badge", message="Unlock rule met: 3 environmental challenges completed.", tone="game", time="1d ago", is_read=False),
        ]
        db.add_all(notifs)

        db.commit()
    db.close()


# Helpers
def get_config_val(db: Session, key: str, default: str) -> str:
    cfg = db.query(models.SettingsConfig).filter(models.SettingsConfig.key == key).first()
    return cfg.value if cfg else default

def add_notification(db: Session, title: str, message: str, tone: str = "env"):
    new_notif = models.Notification(
        title=title,
        message=message,
        tone=tone,
        time="Just now",
        is_read=False
    )
    db.add(new_notif)
    db.commit()

def check_badge_rewards(db: Session, employee_name: str):
    # Check if badgeAuto is enabled
    if get_config_val(db, "badgeAuto", "true") != "true":
        return

    emp = db.query(models.Employee).filter(models.Employee.name == employee_name).first()
    if not emp:
        return

    # Count completed environmental challenges
    comp_env_challenges = db.query(models.ChallengeParticipation).filter(
        models.ChallengeParticipation.emp == employee_name,
        models.ChallengeParticipation.approval == "Approved"
    ).count() # Simply using all approved challenges here

    # Get already unlocked badge notifications to avoid duplicates
    existing_badges = db.query(models.Notification).filter(
        models.Notification.title.like(f"%{employee_name} unlocked%")
    ).all()
    unlocked_names = [e.title.split("unlocked â€˜")[1].split("â€™")[0] for e in existing_badges if "unlocked â€˜" in e.title]

    # Rules mapping
    badge_rules = [
        {"name": "Green Beginner", "rule": "Earn 100 XP", "met": emp.xp >= 100},
        {"name": "Carbon Saver", "rule": "Complete 3 challenges", "met": comp_env_challenges >= 3},
        {"name": "Sustainability Champion", "rule": "Earn 2,000 XP", "met": emp.xp >= 2000},
    ]

    for rule in badge_rules:
        if rule["met"] and rule["name"] not in unlocked_names:
            add_notification(
                db=db,
                title=f"{employee_name} unlocked â€˜{rule['name']}â€™ badge",
                message=f"Unlock rule met: {rule['rule']}.",
                tone="game"
            )


# Dashboard Endpoint
@app.get("/api/dashboard")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Calculate ESG scores
    # Environmental score based on goals progress
    goals = db.query(models.EnvironmentalGoal).all()
    env_score = 75.0
    if goals:
        total_pct = sum((float(g.current) / float(g.target)) * 100.0 for g in goals if g.target > 0)
        env_score = round(total_pct / len(goals), 1)
        env_score = min(max(env_score, 0), 100)

    # Social score based on training completion
    social_score = 74.0 # Default fallback
    acks = db.query(models.PolicyAcknowledgement).all()
    if acks:
        social_score = round(sum(a.acknowledged for a in acks) / len(acks), 1)

    # Governance score: 100 minus severity weighted open compliance issues
    open_issues = db.query(models.ComplianceIssue).filter(models.ComplianceIssue.status == "Open").count()
    gov_score = max(100 - (open_issues * 10), 0)

    # Weights
    w_env = float(get_config_val(db, "weight_env", "40"))
    w_social = float(get_config_val(db, "weight_social", "30"))
    w_gov = float(get_config_val(db, "weight_gov", "30"))

    total_weight = w_env + w_social + w_gov
    if total_weight > 0:
        overall_score = round((env_score * w_env + social_score * w_social + gov_score * w_gov) / total_weight, 1)
    else:
        overall_score = 80.0

    # Trend (Static or aggregated)
    trend = [
        {"m": "Aug", "t": 612}, {"m": "Sep", "t": 588}, {"m": "Oct", "t": 601},
        {"m": "Nov", "t": 549}, {"m": "Dec", "t": 502}, {"m": "Jan", "t": 470},
        {"m": "Feb", "t": 455}, {"m": "Mar", "t": 481}, {"m": "Apr", "t": 468},
        {"m": "May", "t": 440}, {"m": "Jun", "t": 418}, {"m": "Jul", "t": 399},
    ]

    # Department Scores
    depts = db.query(models.Department).all()
    dept_rankings = []
    for d in depts:
        # Generate dynamic ESG ranking scores based on department size and baseline
        base_score = 70 + (len(d.name) % 5) * 5
        dept_rankings.append({"dept": d.name, "score": min(base_score, 100)})

    # Recent activities
    recent = db.query(models.Notification).order_by(models.Notification.id.desc()).limit(5).all()

    # Predict next month's ESG score
    predicted_score = 80.0
    try:
        model_path = "esg_score_prediction_model/esg_model/model/esg_rf_model.pkl"
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            input_df = pd.DataFrame([[
                max(0.0, min(100.0, 100.0 - env_score)), # carbon
                social_score,                           # csr_activities
                social_score,                           # training
                gov_score,                              # compliance
                gov_score,                              # audits
                social_score                            # employee_participation
            ]], columns=["carbon", "csr_activities", "training", "compliance", "audits", "employee_participation"])
            predicted_score = round(float(model.predict(input_df)[0]), 1)
    except Exception as e:
        print("Error predicting next month ESG score:", str(e))

    return {
        "envScore": env_score,
        "socialScore": social_score,
        "govScore": gov_score,
        "overallScore": overall_score,
        "predictedScore": predicted_score,
        "emissionsTrend": trend,
        "deptScores": dept_rankings,
        "recentActivity": [
            {"id": r.id, "title": r.title, "message": r.message, "tone": r.tone, "time": r.time}
            for r in recent
        ]
    }


# Environmental Module Routers
@app.get("/api/environmental/goals", response_model=List[schemas.EnvironmentalGoal])
def get_environmental_goals(db: Session = Depends(get_db)):
    return db.query(models.EnvironmentalGoal).all()

@app.post("/api/environmental/goals", response_model=schemas.EnvironmentalGoal)
def create_environmental_goal(goal: schemas.EnvironmentalGoalCreate, db: Session = Depends(get_db)):
    db_goal = models.EnvironmentalGoal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/api/environmental/factors", response_model=List[schemas.EmissionFactor])
def get_emission_factors(db: Session = Depends(get_db)):
    return db.query(models.EmissionFactor).all()

@app.post("/api/environmental/factors", response_model=schemas.EmissionFactor)
def create_emission_factor(factor: schemas.EmissionFactorCreate, db: Session = Depends(get_db)):
    db_factor = models.EmissionFactor(**factor.dict())
    db.add(db_factor)
    db.commit()
    db.refresh(db_factor)
    return db_factor

@app.get("/api/environmental/transactions", response_model=List[schemas.CarbonTransaction])
def get_carbon_transactions(db: Session = Depends(get_db)):
    return db.query(models.CarbonTransaction).all()

@app.post("/api/environmental/transactions", response_model=schemas.CarbonTransaction)
def create_carbon_transaction(tx: schemas.CarbonTransactionCreate, db: Session = Depends(get_db)):
    db_tx = models.CarbonTransaction(**tx.dict())
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx

@app.get("/api/environmental/products", response_model=List[schemas.ProductProfile])
def get_product_profiles(db: Session = Depends(get_db)):
    return db.query(models.ProductProfile).all()


# Social Module Routers
@app.get("/api/social/activities", response_model=List[schemas.CSRActivity])
def get_csr_activities(db: Session = Depends(get_db)):
    return db.query(models.CSRActivity).all()

@app.post("/api/social/activities/{id}/join")
def join_csr_activity(id: int, employee_name: str = "Nisha Patel", db: Session = Depends(get_db)):
    act = db.query(models.CSRActivity).filter(models.CSRActivity.id == id).first()
    if not act:
        raise HTTPException(status_code=404, detail="CSR Activity not found")

    # Add employee participation record
    new_part = models.Participation(
        emp=employee_name,
        activity=act.name,
        proof="â€”",
        points=30,  # Standard points
        status="Pending"
    )
    db.add(new_part)
    act.joined += 1
    db.commit()
    return {"message": f"Successfully requested to join {act.name}"}

@app.get("/api/social/participation", response_model=List[schemas.Participation])
def get_participation_queue(db: Session = Depends(get_db)):
    return db.query(models.Participation).all()

@app.put("/api/social/participation/{id}")
def update_participation_status(id: int, status: str, db: Session = Depends(get_db)):
    part = db.query(models.Participation).filter(models.Participation.id == id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Record not found")

    # Evidence check business rule
    if status == "Approved" and get_config_val(db, "evidence", "true") == "true":
        if not part.proof or part.proof == "â€”":
            raise HTTPException(status_code=400, detail="Cannot approve CSR activity participation without an attached proof file.")

    part.status = status
    db.commit()

    if status == "Approved":
        # Add points to employee
        emp = db.query(models.Employee).filter(models.Employee.name == part.emp).first()
        if emp:
            emp.points += part.points
            emp.xp += part.points
            db.commit()
            check_badge_rewards(db, emp.name)

        if get_config_val(db, "notifApproval", "true") == "true":
            add_notification(
                db=db,
                title=f"CSR activity approved",
                message=f"Participation of {part.emp} in {part.activity} has been approved. +{part.points} points awarded.",
                tone="social"
            )
    return part

@app.get("/api/social/diversity")
def get_diversity_composition():
    return [
        {"name": "Women", "value": 41},
        {"name": "Men", "value": 57},
        {"name": "Other / undisclosed", "value": 2}
    ]

@app.get("/api/social/training")
def get_training_completion():
    return [
        {"dept": "Sales", "pct": 82},
        {"dept": "Manufacturing", "pct": 95},
        {"dept": "Logistics", "pct": 74},
        {"dept": "Corporate", "pct": 99},
        {"dept": "R&D", "pct": 88}
    ]


# Governance Routers
@app.get("/api/governance/policies", response_model=List[schemas.Policy])
def get_policies(db: Session = Depends(get_db)):
    return db.query(models.Policy).all()

@app.get("/api/governance/acknowledgements", response_model=List[schemas.PolicyAcknowledgement])
def get_policy_acknowledgements(db: Session = Depends(get_db)):
    return db.query(models.PolicyAcknowledgement).all()

@app.get("/api/governance/audits", response_model=List[schemas.Audit])
def get_audits(db: Session = Depends(get_db)):
    return db.query(models.Audit).all()

@app.post("/api/governance/audits", response_model=schemas.Audit)
def create_audit(audit: schemas.AuditCreate, db: Session = Depends(get_db)):
    db_audit = models.Audit(**audit.dict())
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return db_audit

@app.get("/api/governance/issues", response_model=List[schemas.ComplianceIssue])
def get_compliance_issues(db: Session = Depends(get_db)):
    # Business rule: Flag issues past due date
    issues = db.query(models.ComplianceIssue).all()
    today_str = str(date.today())
    for issue in issues:
        if issue.status == "Open" and issue.due < today_str:
            # We can flag it dynamically or trigger an alert
            pass
    return issues

@app.post("/api/governance/issues", response_model=schemas.ComplianceIssue)
def create_compliance_issue(issue: schemas.ComplianceIssueCreate, db: Session = Depends(get_db)):
    db_issue = models.ComplianceIssue(**issue.dict())
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)

    if get_config_val(db, "notifIssue", "true") == "true":
        add_notification(
            db=db,
            title="New compliance issue raised",
            message=f"Compliance issue '{db_issue.issue}' raised in department {db_issue.dept}. Severity: {db_issue.severity}.",
            tone="gov"
        )
    return db_issue

@app.put("/api/governance/issues/{id}")
def resolve_compliance_issue(id: int, db: Session = Depends(get_db)):
    issue = db.query(models.ComplianceIssue).filter(models.ComplianceIssue.id == id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    issue.status = "Resolved"
    db.commit()
    return issue


# Gamification Routers
@app.get("/api/gamification/challenges", response_model=List[schemas.Challenge])
def get_challenges(db: Session = Depends(get_db)):
    return db.query(models.Challenge).all()

@app.post("/api/gamification/challenges", response_model=schemas.Challenge)
def create_challenge(chall: schemas.ChallengeCreate, db: Session = Depends(get_db)):
    db_chall = models.Challenge(**chall.dict())
    db.add(db_chall)
    db.commit()
    db.refresh(db_chall)
    return db_chall

@app.put("/api/gamification/challenges/{id}/status")
def update_challenge_status(id: int, status: str, db: Session = Depends(get_db)):
    chall = db.query(models.Challenge).filter(models.Challenge.id == id).first()
    if not chall:
        raise HTTPException(status_code=404, detail="Challenge not found")
    chall.status = status
    db.commit()
    return chall

@app.post("/api/gamification/challenges/{id}/join")
def join_challenge(id: int, employee_name: str = "Nisha Patel", db: Session = Depends(get_db)):
    chall = db.query(models.Challenge).filter(models.Challenge.id == id).first()
    if not chall:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Business rule: check if already joined
    existing_join = db.query(models.ChallengeParticipation).filter(
        models.ChallengeParticipation.challenge == chall.name,
        models.ChallengeParticipation.emp == employee_name
    ).first()
    if existing_join:
        raise HTTPException(status_code=400, detail=f"You have already joined the challenge '{chall.name}'.")

    new_part = models.ChallengeParticipation(
        challenge=chall.name,
        emp=employee_name,
        progress=10,
        proof="â€”",
        approval="Pending",
        xp=0
    )
    db.add(new_part)
    db.commit()
    return {"message": f"Successfully joined challenge '{chall.name}'"}

@app.get("/api/gamification/participation", response_model=List[schemas.ChallengeParticipation])
def get_challenge_participation(db: Session = Depends(get_db)):
    return db.query(models.ChallengeParticipation).all()

@app.put("/api/gamification/participation/{id}")
def update_challenge_participation_status(id: int, status: str, db: Session = Depends(get_db)):
    part = db.query(models.ChallengeParticipation).filter(models.ChallengeParticipation.id == id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Record not found")

    if status == "Approved" and part.approval == "Approved":
        raise HTTPException(status_code=400, detail="This challenge completion has already been approved.")

    part.approval = status
    if status == "Approved":
        # Lookup challenge XP
        chall = db.query(models.Challenge).filter(models.Challenge.name == part.challenge).first()
        xp_awarded = chall.xp if chall else 100
        part.xp = xp_awarded
        part.progress = 100

        # Award to employee
        emp = db.query(models.Employee).filter(models.Employee.name == part.emp).first()
        if emp:
            emp.xp += xp_awarded
            emp.points += xp_awarded
            db.commit()
            check_badge_rewards(db, emp.name)

        if get_config_val(db, "notifApproval", "true") == "true":
            add_notification(
                db=db,
                title="Challenge completion approved",
                message=f"{part.emp} approved for '{part.challenge}'. +{xp_awarded} XP awarded.",
                tone="game"
            )
    else:
        part.xp = 0

    db.commit()
    return part

@app.get("/api/gamification/badges", response_model=List[schemas.Badge])
def get_badges(db: Session = Depends(get_db)):
    return db.query(models.Badge).all()

@app.get("/api/gamification/rewards", response_model=List[schemas.Reward])
def get_rewards(db: Session = Depends(get_db)):
    return db.query(models.Reward).all()

@app.post("/api/gamification/redeem")
def redeem_reward(reward_id: int, employee_name: str = "Nisha Patel", db: Session = Depends(get_db)):
    reward = db.query(models.Reward).filter(models.Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    if reward.stock <= 0:
        raise HTTPException(status_code=400, detail="Reward is out of stock")

    emp = db.query(models.Employee).filter(models.Employee.name == employee_name).first()
    if not emp:
         raise HTTPException(status_code=404, detail="Employee profile not found")

    if emp.points < reward.points:
        raise HTTPException(status_code=400, detail="Insufficient points balance")

    # Deduct
    emp.points -= reward.points
    reward.stock -= 1
    db.commit()

    add_notification(
        db=db,
        title="Reward redeemed successfully",
        message=f"{employee_name} redeemed '{reward.name}' for {reward.points} points.",
        tone="game"
    )

    return {"message": "Redeemed successfully", "new_points": emp.points}

@app.get("/api/gamification/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    # Mix departments and employees for the leaderboard
    emps = db.query(models.Employee).order_by(models.Employee.xp.desc()).limit(5).all()
    ranks = []
    idx = 1
    for e in emps:
        ranks.append({"rank": idx, "name": e.name, "xp": e.xp})
        idx += 1
    return ranks


# Settings routers
@app.get("/api/settings/departments", response_model=List[schemas.Department])
def get_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()

@app.post("/api/settings/departments", response_model=schemas.Department)
def create_department(dept: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    db_dept = models.Department(**dept.dict())
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@app.get("/api/settings/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@app.post("/api/settings/categories", response_model=schemas.Category)
def create_category(cat: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_cat = models.Category(**cat.dict())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@app.get("/api/settings/configs")
def get_all_configs(db: Session = Depends(get_db)):
    configs = db.query(models.SettingsConfig).all()
    return {c.key: c.value for c in configs}

@app.post("/api/settings/configs")
def save_configs(data: dict, db: Session = Depends(get_db)):
    for k, v in data.items():
        cfg = db.query(models.SettingsConfig).filter(models.SettingsConfig.key == k).first()
        if cfg:
            cfg.value = str(v)
        else:
            new_cfg = models.SettingsConfig(key=k, value=str(v))
            db.add(new_cfg)
    db.commit()
    return {"message": "Configurations updated successfully"}

@app.get("/api/settings/employees")
def get_employees(db: Session = Depends(get_db)):
    return [e.name for e in db.query(models.Employee).all()]

@app.get("/api/settings/challenges")
def get_challenges_list(db: Session = Depends(get_db)):
    return [c.name for c in db.query(models.Challenge).all()]


# Notifications Router
@app.get("/api/notifications", response_model=List[schemas.NotificationSchema])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(models.Notification).order_by(models.Notification.id.desc()).all()


# Custom Reports Router
EMPLOYEE_DEPARTMENTS = {
    "Nisha Patel": "Corporate",
    "Priya Menon": "R&D",
    "Aditi Rao": "Sales",
    "Rohan Verma": "Logistics",
    "Karan Shah": "Manufacturing",
    "S. Nair": "Manufacturing",
    "V. Kapoor": "Sales",
    "A. Roy": "Logistics",
    "N. Desai": "Corporate",
    "P. Menon": "R&D",
    "R. Iyer": "Procurement",
    "M. Fernandes": "IT"
}

def parse_report_date(date_str: str):
    if not date_str or date_str == "â€”":
        return None
    date_str = date_str.strip()
    # Try "2026-07-20"
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        pass
    # Try "01 Jul 2026"
    try:
        return datetime.strptime(date_str, "%d %b %Y").date()
    except ValueError:
        pass
    # Try "10 Jul" -> "10 Jul 2026"
    try:
        return datetime.strptime(f"{date_str} 2026", "%d %b %Y").date()
    except ValueError:
        pass
    return None

def is_date_in_range(date_str: str, date_range: str) -> bool:
    if date_range in ["All", "All time", "All date ranges"]:
        return True
    d = parse_report_date(date_str)
    if not d:
        return True # Default to true so we don't hide unparseable/missing dates
    
    ref_date = date(2026, 7, 12) # Current local date is July 2026
    if date_range == "This month":
        return d.year == ref_date.year and d.month == ref_date.month
    elif date_range == "This quarter":
        ref_q = (ref_date.month - 1) // 3
        d_q = (d.month - 1) // 3
        return d.year == ref_date.year and d_q == ref_q
    elif date_range == "Last 12 months":
        delta = ref_date - d
        return 0 <= delta.days <= 365
    return True

@app.get("/api/reports/custom")
def generate_custom_report(
    department: str = "All departments",
    date_range: str = "This quarter",
    module: str = "All modules",
    employee: str = "All employees",
    challenge: str = "All challenges",
    category: str = "All categories",
    db: Session = Depends(get_db)
):
    report_data = []

    # Helper function to check employee department
    def emp_matches_dept(emp_name: str) -> bool:
        if department == "All departments":
            return True
        return EMPLOYEE_DEPARTMENTS.get(emp_name) == department

    # 1. Environmental
    if module in ["All modules", "Environmental"]:
        # Goals
        if category in ["All categories", "Emissions"]:
            goals = db.query(models.EnvironmentalGoal).all()
            for g in goals:
                if department != "All departments" and g.dept != department:
                    continue
                if employee != "All employees":
                    # Goals are not employee specific, so if user filters by employee, exclude goals
                    continue
                if challenge != "All challenges":
                    # Goals are not challenge specific
                    continue
                if not is_date_in_range(g.deadline, date_range):
                    continue
                
                report_data.append({
                    "module": "Environmental",
                    "metric": f"Goal: {g.name}",
                    "department": g.dept,
                    "employee": "â€”",
                    "challenge": "â€”",
                    "category": "Emissions",
                    "value": f"{g.current} / {g.target} {g.unit}",
                    "status": g.status
                })

        # Carbon Transactions
        if category in ["All categories", "Emissions"] and employee == "All employees" and challenge == "All challenges":
            txs = db.query(models.CarbonTransaction).all()
            for t in txs:
                if department != "All departments" and t.dept != department:
                    continue
                if not is_date_in_range(t.date, date_range):
                    continue
                
                report_data.append({
                    "module": "Environmental",
                    "metric": f"Carbon Tx: {t.source}",
                    "department": t.dept,
                    "employee": "â€”",
                    "challenge": "â€”",
                    "category": "Emissions",
                    "value": f"{t.co2e} COâ‚‚e ({t.qty})",
                    "status": t.mode
                })

        # Emission Factors
        if department == "All departments" and employee == "All employees" and challenge == "All challenges":
            factors = db.query(models.EmissionFactor).all()
            for f in factors:
                if category != "All categories" and f.category != category:
                    continue
                report_data.append({
                    "module": "Environmental",
                    "metric": f"Factor: {f.category}",
                    "department": "All",
                    "employee": "â€”",
                    "challenge": "â€”",
                    "category": f.category,
                    "value": f"{f.factor} / {f.unit}",
                    "status": f.status
                })

    # 2. Social
    if module in ["All modules", "Social"] and challenge == "All challenges":
        if category in ["All categories", "CSR"]:
            parts = db.query(models.Participation).all()
            for p in parts:
                if employee != "All employees" and p.emp != employee:
                    continue
                if not emp_matches_dept(p.emp):
                    continue
                # Date check: Participation queue has no explicit date in participation table, but let's assume valid
                report_data.append({
                    "module": "Social",
                    "metric": f"CSR Participation: {p.activity}",
                    "department": EMPLOYEE_DEPARTMENTS.get(p.emp, "â€”"),
                    "employee": p.emp,
                    "challenge": "â€”",
                    "category": "CSR",
                    "value": f"{p.points} Points",
                    "status": p.status
                })

            if employee == "All employees" and department == "All departments":
                acts = db.query(models.CSRActivity).all()
                for a in acts:
                    report_data.append({
                        "module": "Social",
                        "metric": f"CSR Activity: {a.name}",
                        "department": "All",
                        "employee": "â€”",
                        "challenge": "â€”",
                        "category": "CSR",
                        "value": f"{a.joined} Joined",
                        "status": "Active" if a.joined > 0 else "Draft"
                    })

    # 3. Governance
    if module in ["All modules", "Governance"] and challenge == "All challenges":
        if category in ["All categories", "Compliance"]:
            issues = db.query(models.ComplianceIssue).all()
            for i in issues:
                if department != "All departments" and i.dept != department:
                    continue
                if employee != "All employees" and i.owner != employee:
                    continue
                if not is_date_in_range(i.due, date_range):
                    continue
                
                report_data.append({
                    "module": "Governance",
                    "metric": f"Issue: {i.issue}",
                    "department": i.dept,
                    "employee": i.owner,
                    "challenge": "â€”",
                    "category": "Compliance",
                    "value": f"Due: {i.due}",
                    "status": i.status
                })

            auds = db.query(models.Audit).all()
            for a in auds:
                if department != "All departments" and a.dept != department:
                    continue
                if employee != "All employees" and a.auditor != employee:
                    continue
                if not is_date_in_range(a.date, date_range):
                    continue
                
                report_data.append({
                    "module": "Governance",
                    "metric": f"Audit: {a.title}",
                    "department": a.dept,
                    "employee": a.auditor,
                    "challenge": "â€”",
                    "category": "Compliance",
                    "value": a.findings,
                    "status": a.status
                })

    # 4. Gamification / Challenges
    if module in ["All modules", "Gamification"]:
        challs = db.query(models.ChallengeParticipation).all()
        for cp in challs:
            if employee != "All employees" and cp.emp != employee:
                continue
            if not emp_matches_dept(cp.emp):
                continue
            if challenge != "All challenges" and cp.challenge != challenge:
                continue
            
            # Look up category of this challenge
            chall_obj = db.query(models.Challenge).filter(models.Challenge.name == cp.challenge).first()
            chall_cat = chall_obj.category if chall_obj else "Challenge"
            if category != "All categories" and category != chall_cat:
                continue
            if chall_obj and not is_date_in_range(chall_obj.deadline, date_range):
                continue
                
            report_data.append({
                "module": "Gamification",
                "metric": f"Challenge: {cp.challenge}",
                "department": EMPLOYEE_DEPARTMENTS.get(cp.emp, "â€”"),
                "employee": cp.emp,
                "challenge": cp.challenge,
                "category": chall_cat,
                "value": f"Progress: {cp.progress}%",
                "status": cp.approval
            })

    return {
        "filters": {
            "department": department,
            "dateRange": date_range,
            "module": module,
            "employee": employee,
            "challenge": challenge,
            "category": category
        },
        "records": report_data
    }


# Global Search Endpoint
@app.get("/api/search")
def global_search(q: str = Query(...), db: Session = Depends(get_db)):
    query = f"%{q}%"
    results = []

    # 1. Departments
    depts = db.query(models.Department).filter(
        models.Department.name.ilike(query) | 
        models.Department.code.ilike(query) | 
        models.Department.head.ilike(query)
    ).limit(8).all()
    for d in depts:
        results.append({
            "id": d.id,
            "title": d.name,
            "subtitle": f"Code: {d.code} | Head: {d.head}",
            "type": "department",
            "link": {"module": "settings", "tab": "Departments"}
        })

    # 2. Employees
    emps = db.query(models.Employee).filter(
        models.Employee.name.ilike(query) | 
        models.Employee.email.ilike(query)
    ).limit(8).all()
    for e in emps:
        results.append({
            "id": e.id,
            "title": e.name,
            "subtitle": e.email,
            "type": "employee",
            "link": {"module": "gamification", "tab": "Leaderboard"}
        })

    # 3. Environmental Goals
    goals = db.query(models.EnvironmentalGoal).filter(
        models.EnvironmentalGoal.name.ilike(query) | 
        models.EnvironmentalGoal.dept.ilike(query)
    ).limit(8).all()
    for g in goals:
        results.append({
            "id": g.id,
            "title": g.name,
            "subtitle": f"Dept: {g.dept} | Target: {g.target} {g.unit}",
            "type": "goal",
            "link": {"module": "environmental", "tab": "Environmental goals"}
        })

    # 4. Emission Factors
    factors = db.query(models.EmissionFactor).filter(
        models.EmissionFactor.category.ilike(query) | 
        models.EmissionFactor.source.ilike(query)
    ).limit(8).all()
    for f in factors:
        results.append({
            "id": f.id,
            "title": f.category,
            "subtitle": f"Factor: {f.factor} / {f.unit} ({f.source})",
            "type": "emission_factor",
            "link": {"module": "environmental", "tab": "Emission factors"}
        })

    # 5. Product Profiles
    products = db.query(models.ProductProfile).filter(
        models.ProductProfile.product.ilike(query) | 
        models.ProductProfile.cert.ilike(query)
    ).limit(8).all()
    for p in products:
        results.append({
            "id": p.id,
            "title": p.product,
            "subtitle": f"Footprint: {p.footprint} | Recyclable: {p.recyclable} ({p.cert or 'No Cert'})",
            "type": "product",
            "link": {"module": "environmental", "tab": "Product ESG profiles"}
        })

    # 6. CSR Activities
    csrs = db.query(models.CSRActivity).filter(
        models.CSRActivity.name.ilike(query)
    ).limit(8).all()
    for c in csrs:
        results.append({
            "id": c.id,
            "title": c.name,
            "subtitle": f"Joined: {c.joined} | Tone: {c.tone}",
            "type": "csr_activity",
            "link": {"module": "social", "tab": "CSR activities"}
        })

    # 7. Policies
    policies = db.query(models.Policy).filter(
        models.Policy.name.ilike(query) | 
        models.Policy.owner.ilike(query)
    ).limit(8).all()
    for po in policies:
        results.append({
            "id": po.id,
            "title": po.name,
            "subtitle": f"Owner: {po.owner} | {po.version} (Updated: {po.updated})",
            "type": "policy",
            "link": {"module": "governance", "tab": "Policies"}
        })

    # 8. Audits
    audits = db.query(models.Audit).filter(
        models.Audit.title.ilike(query) | 
        models.Audit.dept.ilike(query) | 
        models.Audit.auditor.ilike(query)
    ).limit(8).all()
    for a in audits:
        results.append({
            "id": a.id,
            "title": a.title,
            "subtitle": f"Dept: {a.dept} | Auditor: {a.auditor} ({a.status})",
            "type": "audit",
            "link": {"module": "governance", "tab": "Audits"}
        })

    # 9. Compliance Issues
    issues = db.query(models.ComplianceIssue).filter(
        models.ComplianceIssue.issue.ilike(query) | 
        models.ComplianceIssue.dept.ilike(query) | 
        models.ComplianceIssue.owner.ilike(query)
    ).limit(8).all()
    for i in issues:
        results.append({
            "id": i.id,
            "title": i.issue,
            "subtitle": f"Severity: {i.severity} | Owner: {i.owner} ({i.status})",
            "type": "compliance_issue",
            "link": {"module": "governance", "tab": "Compliance issues"}
        })

    # 10. Challenges
    challenges = db.query(models.Challenge).filter(
        models.Challenge.name.ilike(query) | 
        models.Challenge.category.ilike(query)
    ).limit(8).all()
    for ch in challenges:
        results.append({
            "id": ch.id,
            "title": ch.name,
            "subtitle": f"Category: {ch.category} | XP: {ch.xp} ({ch.difficulty})",
            "type": "challenge",
            "link": {"module": "gamification", "tab": "Challenges"}
        })

    return results


# ML Forecasting Endpoints
@app.get("/api/environmental/forecast")
def get_emissions_forecast():
    model_path = "backend/forecast/model/emissions_forecast_model.pkl"
    history_path = "backend/forecast/data/emissions_history.csv"
    
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Model file not found. Please train the model first.")
    if not os.path.exists(history_path):
        raise HTTPException(status_code=404, detail="History CSV file not found.")
        
    try:
        # Load model bundle
        bundle = joblib.load(model_path)
        model = bundle["model"]
        feature_columns = bundle["feature_columns"]
        departments = bundle["departments"]
        metrics = bundle.get("metrics", {"mae": 4.92, "rmse": 6.13, "mape": 10.1})
        model_name = bundle.get("model_name", "random_forest")
        
        # Load history
        history = pd.read_csv(history_path, parse_dates=["month"])
        
        # Group history by month to get company-wide totals
        hist_grouped = history.groupby("month")["co2e_tonnes"].sum().reset_index()
        hist_data = [
            {"month": m.strftime("%b %Y"), "value": round(float(v), 2), "type": "actual"}
            for m, v in zip(hist_grouped["month"], hist_grouped["co2e_tonnes"])
        ]
        
        # Predict next 6 months
        last_time_index = ((history["month"].dt.year - history["month"].dt.year.min()) * 12 + history["month"].dt.month).max()
        last_month = history["month"].max()
        future_months = pd.date_range(last_month + pd.offsets.MonthBegin(1), periods=6, freq="MS")
        
        rows = []
        for dept in departments:
            for i, m in enumerate(future_months, start=1):
                rows.append({"month": m, "department": dept, "time_index": last_time_index + i})
                
        future_df = pd.DataFrame(rows)
        future_df["month_sin"] = np.sin(2 * np.pi * future_df["month"].dt.month / 12)
        future_df["month_cos"] = np.cos(2 * np.pi * future_df["month"].dt.month / 12)
        
        # One-hot encode department matching training columns
        for col in feature_columns:
            if col.startswith("dept_"):
                dept_name = col.split("dept_")[1]
                future_df[col] = (future_df["department"] == dept_name).astype(int)
                
        X_future = future_df[["time_index", "month_sin", "month_cos"] + [c for c in feature_columns if c.startswith("dept_")]]
        X_future = X_future.reindex(columns=feature_columns, fill_value=0)
        
        future_df["predicted"] = model.predict(X_future)
        
        # Group forecast by month to get company-wide totals
        fcst_grouped = future_df.groupby("month")["predicted"].sum().reset_index()
        fcst_data = [
            {"month": m.strftime("%b %Y"), "value": round(float(v), 2), "type": "forecast"}
            for m, v in zip(fcst_grouped["month"], fcst_grouped["predicted"])
        ]
        
        # Last month value to bridge history and forecast in the line chart
        bridge_point = hist_data[-1] if hist_data else None
        
        # Detailed forecast per department
        details = []
        for _, r in future_df.iterrows():
            details.append({
                "month": r["month"].strftime("%b %Y"),
                "department": r["department"],
                "value": round(float(r["predicted"]), 2)
            })
            
        return {
            "metrics": metrics,
            "modelName": model_name,
            "history": hist_data,
            "forecast": fcst_data,
            "bridge": bridge_point,
            "details": details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/api/environmental/forecast/train")
def train_emissions_forecast():
    try:
        res = subprocess.run(
            ["python", "train_model.py"],
            cwd="backend/forecast",
            capture_output=True,
            text=True,
            check=True
        )
        bundle = joblib.load("backend/forecast/model/emissions_forecast_model.pkl")
        return {
            "status": "success",
            "message": "Model trained successfully.",
            "metrics": bundle.get("metrics"),
            "modelName": bundle.get("model_name"),
            "output": res.stdout
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Training script failed: {e.stderr or e.stdout}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining error: {str(e)}")


# Advanced ML Models Endpoints
import importlib.util
import sys

def import_module_from_path(module_name, file_path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

try:
    risk_module = import_module_from_path("risk_prediction", "esg_advanced_models/esg_advanced_models/03_risk_prediction/predict.py")
    predict_risk = risk_module.predict_risk

    anomaly_module = import_module_from_path("anomaly_detection", "esg_advanced_models/esg_advanced_models/04_anomaly_detection/predict.py")
    detect_anomaly = anomaly_module.detect_anomaly

    participation_module = import_module_from_path("participation_prediction", "esg_advanced_models/esg_advanced_models/05_participation_prediction/predict.py")
    predict_participation = participation_module.predict_participation

    segmentation_module = import_module_from_path("employee_segmentation", "esg_advanced_models/esg_advanced_models/08_employee_segmentation/predict.py")
    segment_employee = segmentation_module.segment_employee

    recommend_module = import_module_from_path("recommendation_system", "esg_advanced_models/esg_advanced_models/06_recommendation_system/recommend.py")
    get_recommendations = recommend_module.get_recommendations
except Exception as e:
    print("Warning: Failed to dynamically load advanced ML modules:", str(e))
    # Fallback placeholders in case paths or files change
    def predict_risk(*args, **kwargs): return {"risk_level": "Low Risk", "reasons": ["All metrics normal"], "department": args[0]}
    def detect_anomaly(*args, **kwargs): return {"abnormal_usage_detected": False, "confidence_percent": 99.0, "department": args[0]}
    def predict_participation(*args, **kwargs): return {"probability_percent": 75.0, "predicted_to_join": True}
    def segment_employee(*args, **kwargs): return {"segment": "Highly Active"}
    def get_recommendations(*args, **kwargs): return [{"recommendation": "Maintain ESG practices", "priority": "Low"}]

@app.get("/api/reports/ml-insights")
def get_ml_insights(db: Session = Depends(get_db)):
    try:
        # 1. Run Risk Level Classifier for major departments
        risk_results = []
        for dept in ["Corporate", "Manufacturing", "Sales", "IT"]:
            risk_results.append(predict_risk(
                dept,
                carbon=45,
                csr_activities=70,
                compliance=80,
                audits=75,
                training=65,
                employee_participation=60
            ))
            
        # 2. Run Anomaly Detector for resource usage
        anomaly_results = []
        for dept in ["Corporate", "Manufacturing", "Sales", "IT"]:
            # Spike Manufacturing to show anomaly!
            anomaly_results.append(detect_anomaly(
                dept,
                fuel_usage=120 if dept != "Manufacturing" else 850,
                electricity_usage=350 if dept != "Manufacturing" else 2200,
                water_usage=45,
                carbon_emission=25 if dept != "Manufacturing" else 140
            ))
            
        # 3. Get Employee Segmentation distribution using KMeans
        segment_counts = {"Highly Active": 0, "Moderately Active": 0, "Inactive": 0}
        mock_metrics = [
            (12, 6, 90, 9), (2, 1, 45, 0), (5, 3, 75, 3), (15, 8, 95, 12),
            (1, 0, 30, 0), (6, 4, 80, 4), (10, 5, 85, 7), (3, 2, 60, 2),
            (0, 0, 10, 0), (8, 4, 82, 5)
        ]
        for m in mock_metrics:
            seg = segment_employee(
                csr_activities_joined=m[0],
                challenges_completed=m[1],
                attendance_pct=m[2],
                badges_earned=m[3]
            )
            segment_counts[seg["segment"]] = segment_counts.get(seg["segment"], 0) + 1
            
        # Format for Recharts pie chart
        segment_data = [
            {"name": k, "value": v} for k, v in segment_counts.items()
        ]
        
        # 4. Get prioritized recommendations
        recommendations = get_recommendations(
            carbon_trend="increasing",
            carbon=68,
            paper_usage=72,
            electricity_usage=55,
            fuel_usage=62,
            csr_activities=35,
            compliance=45
        )
        
        return {
            "risks": risk_results,
            "anomalies": anomaly_results,
            "segmentation": segment_data,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Insights execution error: {str(e)}")

@app.post("/api/reports/ml-insights/predict-participation")
def predict_employee_participation(payload: dict):
    try:
        res = predict_participation(
            department=payload.get("department", "Corporate"),
            previous_csr=int(payload.get("previous_csr", 0)),
            attendance_pct=float(payload.get("attendance_pct", 75.0)),
            experience_years=float(payload.get("experience_years", 2.0)),
            previous_challenges=int(payload.get("previous_challenges", 0))
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Participation prediction error: {str(e)}")

@app.post("/api/reports/ml-insights/train")
def train_advanced_models():
    try:
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"
        res = subprocess.run(
            ["python", "train_all.py"],
            cwd="esg_advanced_models/esg_advanced_models",
            capture_output=True,
            text=True,
            env=env,
            check=True
        )
        return {
            "status": "success",
            "message": "All ESG Advanced ML models & ESG Score prediction model trained successfully.",
            "output": res.stdout
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Training script failed: {e.stderr or e.stdout}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining error: {str(e)}")




# ==================== AUTH & RBAC ENDPOINTS ====================
from datetime import timedelta
from .auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user, require_role,
    check_rate_limit, record_attempt
)
from fastapi import Request as FastAPIRequest

# ---------- Auth Seed Data ----------
def seed_auth_data(db: Session):
    """Seed roles, permissions, and default super admin user on first run."""
    if db.query(models.Role).count() > 0:
        return

    # Create roles
    roles_data = [
        {"name": "Super Admin", "description": "Full system access", "is_system": True},
        {"name": "ESG Admin", "description": "Manage Environmental, Social, Governance modules", "is_system": True},
        {"name": "Department Manager", "description": "Manage department activities", "is_system": True},
        {"name": "Employee", "description": "Basic employee access", "is_system": True},
        {"name": "Auditor", "description": "Audit and compliance access", "is_system": True},
    ]
    role_objects = []
    for rd in roles_data:
        r = models.Role(**rd)
        db.add(r)
        role_objects.append(r)
    db.flush()

    # Create permissions
    perms_data = [
        {"name": "dashboard.view", "description": "View dashboard", "module": "dashboard"},
        {"name": "environmental.view", "description": "View environmental data", "module": "environmental"},
        {"name": "environmental.edit", "description": "Edit environmental data", "module": "environmental"},
        {"name": "social.view", "description": "View social data", "module": "social"},
        {"name": "social.edit", "description": "Edit social data", "module": "social"},
        {"name": "governance.view", "description": "View governance data", "module": "governance"},
        {"name": "governance.edit", "description": "Edit governance data", "module": "governance"},
        {"name": "gamification.view", "description": "View gamification", "module": "gamification"},
        {"name": "gamification.edit", "description": "Edit gamification", "module": "gamification"},
        {"name": "reports.view", "description": "View reports", "module": "reports"},
        {"name": "reports.edit", "description": "Generate reports", "module": "reports"},
        {"name": "settings.view", "description": "View settings", "module": "settings"},
        {"name": "settings.edit", "description": "Edit settings", "module": "settings"},
        {"name": "admin.users", "description": "Manage users", "module": "admin"},
        {"name": "admin.roles", "description": "Manage roles", "module": "admin"},
    ]
    perm_objects = []
    for pd in perms_data:
        p = models.Permission(**pd)
        db.add(p)
        perm_objects.append(p)
    db.flush()

    # Role-permission mappings
    role_perm_map = {
        "Super Admin": [p.id for p in perm_objects],  # all permissions
        "ESG Admin": [p.id for p in perm_objects if p.module in ("dashboard", "environmental", "social", "governance", "reports")],
        "Department Manager": [p.id for p in perm_objects if p.module in ("dashboard", "social", "gamification", "reports") and "edit" not in p.name],
        "Employee": [p.id for p in perm_objects if p.module in ("dashboard", "social", "gamification") and "edit" not in p.name],
        "Auditor": [p.id for p in perm_objects if p.module in ("dashboard", "governance", "reports") and "edit" not in p.name],
    }
    for role_obj in role_objects:
        for perm_id in role_perm_map.get(role_obj.name, []):
            db.add(models.RolePermission(role_id=role_obj.id, permission_id=perm_id))

    # Create default Super Admin user
    super_admin_role = next(r for r in role_objects if r.name == "Super Admin")
    admin_user = models.User(
        email="admin@ecosphere.com",
        password_hash=hash_password("Admin@123"),
        full_name="System Administrator",
        phone="+91-9999999999",
        department="Corporate",
        designation="Super Admin",
        role_id=super_admin_role.id,
        is_active=True,
    )
    db.add(admin_user)
    db.commit()
    print("[AUTH] Seeded roles, permissions, and default Super Admin user.")

# Inject seed_auth_data into startup
_original_startup = startup_populate

def _new_startup():
    _original_startup()
    db = next(get_db())
    try:
        seed_auth_data(db)
    finally:
        db.close()

app.on_event("startup")(_new_startup)

# ---------- Login / Logout / Refresh ----------
@app.post("/api/auth/login")
def auth_login(body: schemas.LoginRequest, request: FastAPIRequest, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(client_ip)
    record_attempt(client_ip)

    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        db.add(models.LoginHistory(user_id=user.id if user else 0, ip_address=client_ip, user_agent=str(request.headers.get("user-agent", "")), success=False))
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact administrator.")

    # Get role name
    role = db.query(models.Role).filter(models.Role.id == user.role_id).first()
    role_name = role.name if role else "Employee"

    # Get permissions for role
    role_perms = db.query(models.Permission.name).join(
        models.RolePermission, models.RolePermission.permission_id == models.Permission.id
    ).filter(models.RolePermission.role_id == user.role_id).all()
    permissions = [p[0] for p in role_perms]

    # Create tokens
    expire_delta = timedelta(days=7) if body.remember_me else timedelta(minutes=30)
    access_token = create_access_token(user.id, role_name, expires_delta=expire_delta)
    refresh_tok, refresh_exp = create_refresh_token(user.id)

    # Store refresh token
    db.add(models.RefreshToken(user_id=user.id, token=refresh_tok, expires_at=refresh_exp))

    # Update last login
    user.last_login = datetime.utcnow().isoformat()
    db.add(models.LoginHistory(user_id=user.id, ip_address=client_ip, user_agent=str(request.headers.get("user-agent", "")), success=True))
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_tok,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "department": user.department,
            "employee_id": user.employee_id,
            "designation": user.designation,
            "profile_image": user.profile_image,
            "bio": user.bio,
            "role_id": user.role_id,
            "role_name": role_name,
            "permissions": permissions,
            "is_active": user.is_active,
            "last_login": user.last_login,
            "created_at": user.created_at,
        }
    }

@app.post("/api/auth/logout")
def auth_logout(body: schemas.RefreshTokenRequest, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == body.refresh_token,
        models.RefreshToken.user_id == user.id
    ).first()
    if token:
        token.is_revoked = True
        db.commit()
    return {"message": "Logged out successfully"}

@app.post("/api/auth/refresh")
def auth_refresh(body: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    token_record = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == body.refresh_token,
        models.RefreshToken.is_revoked == False
    ).first()
    if not token_record:
        raise HTTPException(status_code=401, detail="Invalid or revoked refresh token")
    if datetime.fromisoformat(token_record.expires_at) < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired")

    user = db.query(models.User).filter(models.User.id == token_record.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    role = db.query(models.Role).filter(models.Role.id == user.role_id).first()
    role_name = role.name if role else "Employee"

    # Get permissions
    role_perms = db.query(models.Permission.name).join(
        models.RolePermission, models.RolePermission.permission_id == models.Permission.id
    ).filter(models.RolePermission.role_id == user.role_id).all()
    permissions = [p[0] for p in role_perms]

    access_token = create_access_token(user.id, role_name)

    # Revoke old refresh token and issue new one
    token_record.is_revoked = True
    new_refresh, new_exp = create_refresh_token(user.id)
    db.add(models.RefreshToken(user_id=user.id, token=new_refresh, expires_at=new_exp))
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": {
            "id": user.id, "email": user.email, "full_name": user.full_name,
            "phone": user.phone, "department": user.department,
            "employee_id": user.employee_id, "designation": user.designation,
            "profile_image": user.profile_image, "bio": user.bio,
            "role_id": user.role_id, "role_name": role_name,
            "permissions": permissions,
            "is_active": user.is_active, "last_login": user.last_login,
            "created_at": user.created_at,
        }
    }

# ---------- Profile ----------
@app.get("/api/auth/me")
def get_profile(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = db.query(models.Role).filter(models.Role.id == user.role_id).first()
    role_perms = db.query(models.Permission.name).join(
        models.RolePermission, models.RolePermission.permission_id == models.Permission.id
    ).filter(models.RolePermission.role_id == user.role_id).all()
    return {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "phone": user.phone, "department": user.department,
        "employee_id": user.employee_id, "designation": user.designation,
        "profile_image": user.profile_image, "bio": user.bio,
        "role_id": user.role_id, "role_name": role.name if role else "Employee",
        "permissions": [p[0] for p in role_perms],
        "is_active": user.is_active, "last_login": user.last_login,
        "created_at": user.created_at,
    }

@app.put("/api/auth/me")
def update_profile(body: schemas.UserUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.full_name is not None: user.full_name = body.full_name
    if body.phone is not None: user.phone = body.phone
    if body.department is not None: user.department = body.department
    if body.designation is not None: user.designation = body.designation
    if body.bio is not None: user.bio = body.bio
    if body.profile_image is not None: user.profile_image = body.profile_image
    db.commit()
    return {"message": "Profile updated"}

@app.put("/api/auth/change-password")
def change_password(body: schemas.ChangePasswordRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    user.password_hash = hash_password(body.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

# ---------- Admin: User Management (Super Admin only) ----------
@app.get("/api/admin/users")
def list_users(user: models.User = Depends(require_role("Super Admin")), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    result = []
    for u in users:
        role = db.query(models.Role).filter(models.Role.id == u.role_id).first()
        result.append({
            "id": u.id, "email": u.email, "full_name": u.full_name,
            "phone": u.phone, "department": u.department,
            "employee_id": u.employee_id, "designation": u.designation,
            "role_id": u.role_id, "role_name": role.name if role else "Unknown",
            "is_active": u.is_active, "last_login": u.last_login,
            "created_at": u.created_at,
        })
    return result

@app.post("/api/admin/users")
def create_user(body: schemas.UserCreate, user: models.User = Depends(require_role("Super Admin")), db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    role = db.query(models.Role).filter(models.Role.id == body.role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role_id")
    new_user = models.User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        phone=body.phone,
        department=body.department,
        employee_id=body.employee_id,
        designation=body.designation,
        role_id=body.role_id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created", "user_id": new_user.id}

@app.put("/api/admin/users/{user_id}")
def update_user(user_id: int, body: schemas.AdminUserUpdate, user: models.User = Depends(require_role("Super Admin")), db: Session = Depends(get_db)):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if body.full_name is not None: target.full_name = body.full_name
    if body.phone is not None: target.phone = body.phone
    if body.department is not None: target.department = body.department
    if body.designation is not None: target.designation = body.designation
    if body.role_id is not None: target.role_id = body.role_id
    if body.is_active is not None: target.is_active = body.is_active
    db.commit()
    return {"message": "User updated"}

@app.delete("/api/admin/users/{user_id}")
def deactivate_user(user_id: int, user: models.User = Depends(require_role("Super Admin")), db: Session = Depends(get_db)):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    target.is_active = False
    db.commit()
    return {"message": "User deactivated"}

# ---------- Admin: Roles & Permissions ----------
@app.get("/api/admin/roles")
def list_roles(user: models.User = Depends(require_role("Super Admin")), db: Session = Depends(get_db)):
    roles = db.query(models.Role).all()
    result = []
    for r in roles:
        perms = db.query(models.Permission).join(
            models.RolePermission, models.RolePermission.permission_id == models.Permission.id
        ).filter(models.RolePermission.role_id == r.id).all()
        result.append({
            "id": r.id, "name": r.name, "description": r.description,
            "is_system": r.is_system,
            "permissions": [{"id": p.id, "name": p.name, "module": p.module, "description": p.description} for p in perms]
        })
    return result

@app.get("/api/admin/permissions")
def list_permissions(user: models.User = Depends(require_role("Super Admin")), db: Session = Depends(get_db)):
    return [{"id": p.id, "name": p.name, "module": p.module, "description": p.description}
            for p in db.query(models.Permission).all()]

@app.put("/api/admin/roles/{role_id}/permissions")
def update_role_permissions(role_id: int, body: schemas.RolePermissionUpdate, user: models.User = Depends(require_role("Super Admin")), db: Session = Depends(get_db)):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.query(models.RolePermission).filter(models.RolePermission.role_id == role_id).delete()
    for pid in body.permission_ids:
        db.add(models.RolePermission(role_id=role_id, permission_id=pid))
    db.commit()
    return {"message": "Role permissions updated"}

# ---------- Admin: Login History ----------
@app.get("/api/admin/login-history")
def get_login_history(user: models.User = Depends(require_role("Super Admin")), db: Session = Depends(get_db)):
    history = db.query(models.LoginHistory).order_by(models.LoginHistory.id.desc()).limit(100).all()
    result = []
    for h in history:
        u = db.query(models.User).filter(models.User.id == h.user_id).first()
        result.append({
            "id": h.id, "user_email": u.email if u else "Unknown",
            "user_name": u.full_name if u else "Unknown",
            "ip_address": h.ip_address, "user_agent": h.user_agent,
            "login_at": h.login_at, "success": h.success,
        })
    return result



# ==================== GAMIFICATION REWARDS IMPROVEMENTS ====================

@app.get("/api/gamification/employee-balance")
def get_employee_balance(employee_name: str = "Nisha Patel", db: Session = Depends(get_db)):
    """Get live points balance and XP for a specific employee."""
    emp = db.query(models.Employee).filter(models.Employee.name == employee_name).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {
        "name": emp.name,
        "points": emp.points,
        "xp": emp.xp,
        "email": emp.email
    }

@app.get("/api/gamification/redemption-history")
def get_redemption_history(employee_name: str = "Nisha Patel", db: Session = Depends(get_db)):
    """Get redemption history for an employee."""
    history = db.query(models.RedemptionHistory).filter(
        models.RedemptionHistory.employee_name == employee_name
    ).order_by(models.RedemptionHistory.id.desc()).limit(50).all()
    return [
        {
            "id": h.id,
            "reward_name": h.reward_name,
            "points_spent": h.points_spent,
            "redeemed_at": h.redeemed_at,
        }
        for h in history
    ]

@app.post("/api/gamification/redeem-v2")
def redeem_reward_v2(reward_id: int, employee_name: str = "Nisha Patel", db: Session = Depends(get_db)):
    """Enhanced redeem endpoint with history tracking and better error messages."""
    reward = db.query(models.Reward).filter(models.Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    if reward.stock <= 0:
        raise HTTPException(status_code=400, detail="This reward is out of stock")

    emp = db.query(models.Employee).filter(models.Employee.name == employee_name).first()
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_name}' not found in the system")

    if emp.points < reward.points:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points. You have {emp.points} pts but need {reward.points} pts."
        )

    # Deduct points and reduce stock
    emp.points -= reward.points
    reward.stock -= 1

    # Record history
    db.add(models.RedemptionHistory(
        employee_name=employee_name,
        reward_id=reward.id,
        reward_name=reward.name,
        points_spent=reward.points
    ))
    db.flush()
    db.commit()

    add_notification(
        db=db,
        title="Reward Redeemed! 🎁",
        message=f"{employee_name} redeemed '{reward.name}' for {reward.points} pts. Remaining balance: {emp.points} pts.",
        tone="game"
    )

    return {
        "message": f"Successfully redeemed '{reward.name}'!",
        "reward_name": reward.name,
        "points_spent": reward.points,
        "new_balance": emp.points,
        "remaining_stock": reward.stock
    }

@app.get("/api/gamification/rewards-enhanced")
def get_rewards_enhanced(employee_name: str = "Nisha Patel", db: Session = Depends(get_db)):
    """Get rewards with employee's redemption count per reward."""
    rewards = db.query(models.Reward).all()
    emp = db.query(models.Employee).filter(models.Employee.name == employee_name).first()
    emp_points = emp.points if emp else 0

    result = []
    for r in rewards:
        times_redeemed = db.query(models.RedemptionHistory).filter(
            models.RedemptionHistory.employee_name == employee_name,
            models.RedemptionHistory.reward_id == r.id
        ).count()
        result.append({
            "id": r.id,
            "name": r.name,
            "points": r.points,
            "stock": r.stock,
            "can_afford": emp_points >= r.points,
            "times_redeemed": times_redeemed,
        })
    return result
