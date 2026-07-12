from sqlalchemy import Column, Integer, String, Boolean, Numeric
from .database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    head = Column(String)
    employees = Column(Integer, default=0)
    status = Column(String, default="Active")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, default="Active")

class EmissionFactor(Base):
    __tablename__ = "emission_factors"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    factor = Column(String, nullable=False)
    source = Column(String)
    status = Column(String, default="Active")

class ProductProfile(Base):
    __tablename__ = "product_profiles"
    id = Column(Integer, primary_key=True, index=True)
    product = Column(String, nullable=False)
    footprint = Column(String, nullable=False)
    recyclable = Column(String, nullable=False)
    cert = Column(String)

class EnvironmentalGoal(Base):
    __tablename__ = "environmental_goals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    dept = Column(String, nullable=False)
    target = Column(Numeric, nullable=False)
    current = Column(Numeric, nullable=False)
    unit = Column(String, nullable=False)
    deadline = Column(String, nullable=False)
    status = Column(String, default="Active")

class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner = Column(String, nullable=False)
    version = Column(String, nullable=False)
    updated = Column(String, nullable=False)

class PolicyAcknowledgement(Base):
    __tablename__ = "policy_acknowledgements"
    id = Column(Integer, primary_key=True, index=True)
    dept = Column(String, nullable=False)
    acknowledged = Column(Integer, default=0)

class Audit(Base):
    __tablename__ = "audits"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    dept = Column(String, nullable=False)
    auditor = Column(String, nullable=False)
    date = Column(String, nullable=False)
    findings = Column(String)
    status = Column(String, default="Active")

class ComplianceIssue(Base):
    __tablename__ = "compliance_issues"
    id = Column(Integer, primary_key=True, index=True)
    issue = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    dept = Column(String, nullable=False)
    owner = Column(String, nullable=False)
    due = Column(String, nullable=False)
    status = Column(String, default="Open")

class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    xp = Column(Integer, nullable=False)
    difficulty = Column(String, nullable=False)
    deadline = Column(String, nullable=False)
    status = Column(String, default="Draft")
    category = Column(String, nullable=False)

class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    rule = Column(String, nullable=False)
    icon = Column(String, nullable=False)

class Reward(Base):
    __tablename__ = "rewards"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    points = Column(Integer, nullable=False)
    stock = Column(Integer, default=0)

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    xp = Column(Integer, default=0)
    points = Column(Integer, default=0)

class CSRActivity(Base):
    __tablename__ = "csr_activities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    joined = Column(Integer, default=0)
    evidence = Column(Boolean, default=False)
    tone = Column(String, default="env")

class Participation(Base):
    __tablename__ = "participation"
    id = Column(Integer, primary_key=True, index=True)
    emp = Column(String, nullable=False)
    activity = Column(String, nullable=False)
    proof = Column(String)
    points = Column(Integer, default=0)
    status = Column(String, default="Pending")

class ChallengeParticipation(Base):
    __tablename__ = "challenge_participation"
    id = Column(Integer, primary_key=True, index=True)
    challenge = Column(String, nullable=False)
    emp = Column(String, nullable=False)
    progress = Column(Integer, default=0)
    proof = Column(String)
    approval = Column(String, default="Pending")
    xp = Column(Integer, default=0)

class CarbonTransaction(Base):
    __tablename__ = "carbon_transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    dept = Column(String, nullable=False)
    source = Column(String, nullable=False)
    qty = Column(String, nullable=False)
    co2e = Column(String, nullable=False)
    mode = Column(String, nullable=False)

class SettingsConfig(Base):
    __tablename__ = "settings_config"
    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    tone = Column(String, default="env")
    time = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)


# ==================== AUTH & RBAC MODELS ====================
from sqlalchemy import ForeignKey, DateTime, Text
from datetime import datetime

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    is_system = Column(Boolean, default=True)

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    module = Column(String, nullable=False)

class RolePermission(Base):
    __tablename__ = "role_permissions"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    department = Column(String)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    designation = Column(String)
    profile_image = Column(Text)
    bio = Column(Text)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(String)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(String, nullable=False)
    is_revoked = Column(Boolean, default=False)

class LoginHistory(Base):
    __tablename__ = "login_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ip_address = Column(String)
    user_agent = Column(String)
    login_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    success = Column(Boolean, default=True)


# Redemption History tracking
class RedemptionHistory(Base):
    __tablename__ = "redemption_history"
    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String, nullable=False)
    reward_id = Column(Integer, ForeignKey("rewards.id"))
    reward_name = Column(String, nullable=False)
    points_spent = Column(Integer, nullable=False)
    redeemed_at = Column(String, default=lambda: datetime.utcnow().isoformat())
