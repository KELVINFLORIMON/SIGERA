import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import Seccion

db = SessionLocal()
print("Secciones:")
try:
    secciones = db.query(Seccion).all()
    for s in secciones:
        if s.grado_id == 27:
            print(f"ID:{s.id} Nombre:{s.nombre} GradoID:{s.grado_id}")
except Exception as e:
    print("Error:", e)

db.close()
