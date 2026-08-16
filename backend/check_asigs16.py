import sys
import os
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.api.endpoints.asignaciones import listar_asignaciones_por_docente

db = SessionLocal()
print("Probando serialización JSON del endpoint...")
try:
    res = listar_asignaciones_por_docente(docente_id=3, anio_escolar_id=19, db=db, current_user=None)
    
    # Simulate FastAPI response serialization
    from fastapi.encoders import jsonable_encoder
    json_data = jsonable_encoder(res)
    print(json.dumps(json_data, indent=2))
except Exception as e:
    print("Error:", e)

db.close()
