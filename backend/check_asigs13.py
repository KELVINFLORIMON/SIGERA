import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import Grado

db = SessionLocal()
print("Grado 28:")
g = db.query(Grado).filter(Grado.id == 28).first()
if g:
    print(f"ID:{g.id} Nombre:{g.nombre} Anio:{g.anio_escolar_id}")
else:
    print("No existe")

db.close()
