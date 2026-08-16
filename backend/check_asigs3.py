import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.api.endpoints.asignaciones import listar_asignaciones_por_seccion
from app.models import AsignacionDocente

db = SessionLocal()
print("Llamando a listar_asignaciones_por_seccion(23)...")
try:
    # also query raw
    raw = db.query(AsignacionDocente).filter(AsignacionDocente.seccion_id == 23).all()
    print("RAW en BD:")
    for r in raw:
        print(r.id, r.docente_id, r.seccion_id)
        
    print("\nAPI Response:")
    res = listar_asignaciones_por_seccion(seccion_id=23, db=db, current_user=None)
    for r in res:
        print(r)
except Exception as e:
    print("Error:", e)

db.close()
