import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.api.endpoints.usuarios import listar_usuarios

db = SessionLocal()
print("Usuarios:")
try:
    res = listar_usuarios(db=db, current_user=None)
    for u in res:
        if "DOCENTE" in u.roles:
            print(f"ID:{u.id} DocenteID:{getattr(u, 'docente_id', 'MISSING')} Nombre:{u.nombre_completo}")
except Exception as e:
    print("Error:", e)

db.close()
