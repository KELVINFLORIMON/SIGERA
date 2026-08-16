import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import AsignacionDocente

db = SessionLocal()
print("Asignaciones en DB:")
for a in db.query(AsignacionDocente).all():
    print(f"ID:{a.id} Docente:{a.docente_id} Asignatura:{a.asignatura_id} Seccion:{a.seccion_id} Anio:{a.anio_escolar_id}")
db.close()
