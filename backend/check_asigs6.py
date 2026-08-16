import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import Grado

db = SessionLocal()
print("Grados:")
try:
    grados = db.query(Grado).all()
    for g in grados:
        print(f"ID:{g.id} Numero:{g.numero} Nombre:{g.nombre}")
except Exception as e:
    print("Error:", e)

db.close()
