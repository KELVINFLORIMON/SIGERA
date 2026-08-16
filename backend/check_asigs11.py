import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.api.endpoints.asignaciones import listar_asignaciones_por_docente

db = SessionLocal()
print("Llamando a listar_asignaciones_por_docente(3, 19)...")
try:
    res = listar_asignaciones_por_docente(docente_id=3, anio_escolar_id=19, db=db, current_user=None)
    for r in res:
        print(f"ID:{r.id} Asig:{r.asignatura_id} Secc:{r.seccion_id}")
except Exception as e:
    print("Error:", e)

db.close()
