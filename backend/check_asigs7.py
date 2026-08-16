import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import GradoAsignatura, Asignatura

db = SessionLocal()
print("Asignaturas para Grado 27 (Segundo Grado):")
try:
    grado_asignaturas = db.query(GradoAsignatura).filter(GradoAsignatura.grado_id == 27).all()
    for ga in grado_asignaturas:
        asignatura = db.query(Asignatura).filter(Asignatura.id == ga.asignatura_id).first()
        print(f"ga.id={ga.id}, asignatura_id={ga.asignatura_id}, nombre={asignatura.nombre}")
except Exception as e:
    print("Error:", e)

db.close()
