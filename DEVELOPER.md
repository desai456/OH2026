# 🛠️ EcoSphere ESG Platform — Developer Documentation

Welcome to the **EcoSphere ESG Platform** codebase! This documentation is designed to help new developers quickly understand the project structure, system architecture, tech stack, and setup procedures.

---

## 🏛️ System Architecture

EcoSphere is structured as a decoupled full-stack application:
1. **Frontend**: A modular **React** application built with **Vite**.
2. **Backend**: A **FastAPI** web framework serving JSON APIs and integrating Machine Learning prediction models.
3. **Database**: A local **SQLite** database managed via **SQLAlchemy ORM**.
4. **Machine Learning**: Pre-trained prediction pipelines (e.g., Random Forest Regressor) for forecasting ESG metrics.

```
┌─────────────────────────────────┐
│     Vite + React Frontend       │
└────────────────┬────────────────┘
                 │
        HTTP REST APIs (JSON)
                 │
                 ▼
┌─────────────────────────────────┐
│         FastAPI Backend         │
└──────┬───────────────────┬──────┘
       │                   │
  SQLAlchemy ORM      joblib.load()
       │                   │
       ▼                   ▼
┌──────────────┐   ┌──────────────────────┐
│ SQLite DB    │   │ Pre-trained ML Models│
│ (ecosphere)  │   │ (Random Forest, etc.)│
└──────────────┘   └──────────────────────┘
```

---

## 📂 Project Directory Structure

```text
OH2026/
├── backend/                      # FastAPI Backend
│   ├── database.py               # SQLite connection setup & DB session helper
│   ├── main.py                   # API routes, business logic, & database seeding
│   ├── models.py                 # SQLAlchemy Database Models
│   └── schemas.py                # Pydantic Schemas for validation and serialization
├── database/                     # Database scripts & schemas
├── src/                          # React Frontend
│   ├── components/
│   │   └── modules/              # Individual modular tabs (Dashboard, Env, Social, Gov, Gamification, Reports, Settings)
│   ├── constants/
│   │   ├── api.js                # Frontend API fetch services & client endpoints
│   │   ├── config.js             # General layout config, navigation tree, & themes
│   │   └── mockData.js           # Fallback mock data when API is offline
│   ├── styles/                   # CSS stylesheets for the app and modules
│   ├── App.jsx                   # Main entry layout, sidebar navigation, and module switcher
│   └── main.jsx                  # React DOM mounting
├── emissions-forecast-ml/        # ML pipeline for carbon emissions forecasting
├── esg_score_prediction_model/   # ML pipeline for overall ESG score prediction
├── ecosphere.db                  # Local SQLite database file (auto-seeded on startup)
├── package.json                  # Frontend node dependencies & scripts
├── vite.config.js                # Vite development server configuration
└── README.md                     # General product overview
```

---

## 🚀 Getting Started & Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (3.8+ recommended)

---

### 1. Setting Up the Backend

The backend utilizes **FastAPI** and runs on port **8000** by default.

1. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy pandas numpy scikit-learn joblib
   ```
2. Start the FastAPI development server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   *Note: On its first startup, the backend automatically creates and seeds the `ecosphere.db` database with sample departments, compliance issues, policies, and challenges.*

---

### 2. Setting Up the Frontend

The frontend uses **Vite** and runs on port **3000**.

1. Install npm packages:
   ```bash
   npm install
   ```
2. Start the Vite local development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to: `http://localhost:3000/`

---

## 🔌 API & Frontend Integration

All frontend-to-backend communication is centralized in `src/constants/api.js`. The client points to `http://localhost:8000/api`.

Key service endpoints include:
- **Dashboard**: `/dashboard`
- **Environmental**: `/environmental/goals`, `/environmental/factors`, `/environmental/transactions`
- **Social**: `/social/activities`, `/social/participation`, `/social/diversity`
- **Governance**: `/governance/policies`, `/governance/audits`, `/governance/issues`
- **Gamification**: `/gamification/challenges`, `/gamification/badges`, `/gamification/rewards`

---

## 💾 Database Schema

The SQLite database (`ecosphere.db`) is mapped using SQLAlchemy. Key tables include:
- `Department`: Holds department info (employee counts, head, status).
- `EnvironmentalGoal`: Tracks organizational sustainability goals.
- `CarbonTransaction`: Individual logged carbon events.
- `ComplianceIssue`: Governance compliance tickets (due dates, severity).
- `Challenge` / `ChallengeParticipation`: Gamification elements and employee progress logs.
- `Employee`: Tracks XP points and rewards.

---

## 🤖 Machine Learning Integration

EcoSphere incorporates ML-driven forecasting:
- **ESG Score Forecasting**: In `backend/main.py`, a Random Forest Regressor (`esg_rf_model.pkl`) predicts the next month's overall ESG score.
- Input features: `carbon`, `csr_activities`, `training`, `compliance`, `audits`, and `employee_participation`.
- The model is loaded at server startup using `joblib`.
