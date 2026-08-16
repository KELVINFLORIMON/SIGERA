import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import AsignacionDocente, Seccion, Asignatura
from app.models.personas import Docente

db = SessionLocal()
print("Conectado a la base de datos.")

asignaciones = db.query(AsignacionDocente).all()
print(f"\nTotal asignaciones: {len(asignaciones)}")
for a in asignaciones:
    sec = db.query(Seccion).filter(Seccion.id == a.seccion_id).first()
    asig = db.query(Asignatura).filter(Asignatura.id == a.asignatura_id).first()
    doc = db.query(Docente).filter(Docente.id == a.docente_id).first()
    
    sec_nom = sec.nombre if sec else 'None'
    asig_nom = asig.nombre if asig else 'None'
    doc_nom = f"{doc.primer_nombre} {doc.primer_apellido}" if doc else 'None'
    print(f"ID:{a.id} | Sec:{a.seccion_id}({sec_nom}) | Asig:{a.asignatura_id}({asig_nom}) | Doc:{a.docente_id}({doc_nom}) | Anio:{a.anio_escolar_id}")

db.close()
