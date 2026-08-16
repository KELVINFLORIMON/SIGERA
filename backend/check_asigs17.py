import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import AsignacionDocente, Seccion, Grado

db = SessionLocal()
print("Asignaciones Docente 3:")
for a in db.query(AsignacionDocente).filter(AsignacionDocente.docente_id == 3).all():
    s = db.query(Seccion).filter(Seccion.id == a.seccion_id).first()
    g = db.query(Grado).filter(Grado.id == s.grado_id).first() if s else None
    print(f"ID:{a.id} Asig:{a.asignatura_id} Secc:{a.seccion_id} SeccAnio:{g.anio_escolar_id if g else 'None'} AsigAnio:{a.anio_escolar_id}")
db.close()
