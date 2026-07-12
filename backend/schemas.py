from pydantic import BaseModel
from typing import Optional, List

class DepartmentBase(BaseModel):
    name: str
    code: str
    head: Optional[str] = None
    employees: Optional[int] = 0
    status: Optional[str] = "Active"

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    class Config:
        orm_mode = True

class CategoryBase(BaseModel):
    name: str
    type: str
    status: Optional[str] = "Active"

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        orm_mode = True

class EmissionFactorBase(BaseModel):
    category: str
    unit: str
    factor: str
    source: Optional[str] = None
    status: Optional[str] = "Active"

class EmissionFactorCreate(EmissionFactorBase):
    pass

class EmissionFactor(EmissionFactorBase):
    id: int
    class Config:
        orm_mode = True

class ProductProfile(BaseModel):
    id: int
    product: str
    footprint: str
    recyclable: str
    cert: Optional[str] = None
    class Config:
        orm_mode = True

class EnvironmentalGoalBase(BaseModel):
    name: str
    dept: str
    target: float
    current: float
    unit: str
    deadline: str
    status: Optional[str] = "Active"

class EnvironmentalGoalCreate(EnvironmentalGoalBase):
    pass

class EnvironmentalGoal(EnvironmentalGoalBase):
    id: int
    class Config:
        orm_mode = True

class Policy(BaseModel):
    id: int
    name: str
    owner: str
    version: str
    updated: str
    class Config:
        orm_mode = True

class PolicyAcknowledgement(BaseModel):
    id: int
    dept: str
    acknowledged: int
    class Config:
        orm_mode = True

class AuditBase(BaseModel):
    title: str
    dept: str
    auditor: str
    date: str
    findings: Optional[str] = None
    status: Optional[str] = "Active"

class AuditCreate(AuditBase):
    pass

class Audit(AuditBase):
    id: int
    class Config:
        orm_mode = True

class ComplianceIssueBase(BaseModel):
    issue: str
    severity: str
    dept: str
    owner: str
    due: str
    status: Optional[str] = "Open"

class ComplianceIssueCreate(ComplianceIssueBase):
    pass

class ComplianceIssue(ComplianceIssueBase):
    id: int
    class Config:
        orm_mode = True

class ChallengeBase(BaseModel):
    name: str
    xp: int
    difficulty: str
    deadline: str
    status: Optional[str] = "Draft"
    category: str

class ChallengeCreate(ChallengeBase):
    pass

class Challenge(ChallengeBase):
    id: int
    class Config:
        orm_mode = True

class Badge(BaseModel):
    id: int
    name: str
    rule: str
    icon: str
    class Config:
        orm_mode = True

class Reward(BaseModel):
    id: int
    name: str
    points: int
    stock: int
    class Config:
        orm_mode = True

class Employee(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    xp: int
    points: int
    class Config:
        orm_mode = True

class CSRActivity(BaseModel):
    id: int
    name: str
    icon: str
    joined: int
    evidence: bool
    tone: str
    class Config:
        orm_mode = True

class ParticipationBase(BaseModel):
    emp: str
    activity: str
    proof: Optional[str] = "â€”"
    points: int
    status: Optional[str] = "Pending"

class ParticipationCreate(ParticipationBase):
    pass

class Participation(ParticipationBase):
    id: int
    class Config:
        orm_mode = True

class ChallengeParticipationBase(BaseModel):
    challenge: str
    emp: str
    progress: int
    proof: Optional[str] = "â€”"
    approval: Optional[str] = "Pending"
    xp: Optional[int] = 0

class ChallengeParticipationCreate(ChallengeParticipationBase):
    pass

class ChallengeParticipation(ChallengeParticipationBase):
    id: int
    class Config:
        orm_mode = True

class CarbonTransactionBase(BaseModel):
    date: str
    dept: str
    source: str
    qty: str
    co2e: str
    mode: str

class CarbonTransactionCreate(CarbonTransactionBase):
    pass

class CarbonTransaction(CarbonTransactionBase):
    id: int
    class Config:
        orm_mode = True

class SettingsConfigSchema(BaseModel):
    key: str
    value: str
    class Config:
        orm_mode = True

class NotificationSchema(BaseModel):
    id: int
    title: str
    message: str
    tone: str
    time: str
    is_read: bool
    class Config:
        orm_mode = True


# ==================== AUTH & RBAC SCHEMAS ====================

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False

class RoleSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_system: Optional[bool] = True
    class Config:
        orm_mode = True

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[int] = None
    designation: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    role_id: int
    role_name: Optional[str] = None
    is_active: bool
    last_login: Optional[str] = None
    created_at: Optional[str] = None
    class Config:
        orm_mode = True

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[int] = None
    designation: Optional[str] = None
    role_id: int

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PermissionSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    module: str
    class Config:
        orm_mode = True

class RolePermissionUpdate(BaseModel):
    permission_ids: List[int]
