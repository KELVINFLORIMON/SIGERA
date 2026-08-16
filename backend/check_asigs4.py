import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.api.endpoints.competencias import listar_asignaturas_grado

db = SessionLocal()
print("Llamando a listar_asignaturas_grado(3)...")
try:
    res = listar_asignaturas_grado(grado_id=3, db=db, current_user=None)
    for r in res:
        print(f"ID:{r['id']} | AsigID:{r.get('asignatura_id')} | Nombre:{r.get('asignatura_nombre')}")
except Exception as e:
    print("Error:", e)

db.close()
