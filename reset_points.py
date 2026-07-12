import sys
sys.path.insert(0, r'C:\Users\HP\OneDrive\Tài liệu\Desktop\test\OH2026')
from backend.database import SessionLocal
from backend import models
db = SessionLocal()
emp = db.query(models.Employee).filter(models.Employee.name == 'Nisha Patel').first()
if emp:
    emp.points = 640
    db.commit()
    print(f'Reset Nisha points to 640. XP={emp.xp}')
else:
    print('Not found')
db.close()
