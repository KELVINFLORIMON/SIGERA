import sys
from sqlalchemy import text
from app.db.session import SessionLocal

db = SessionLocal()
try:
    print("Altering enum ModalidadTipo...")
    db.execute(text("ALTER TYPE modalidadtipo ADD VALUE IF NOT EXISTS 'ACADEMICA'"))
except Exception as e:
    print("Error Modalidad:", e)

try:
    print("Altering enum TandaTipo...")
    db.execute(text("ALTER TYPE tandatipo ADD VALUE IF NOT EXISTS 'JEE'"))
except Exception as e:
    print("Error Tanda:", e)

try:
    db.commit()
    print("Enums updated successfully!")
except Exception as e:
    db.rollback()
    print("Commit failed:", e)
finally:
    db.close()
