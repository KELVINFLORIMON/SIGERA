import sys
import os

# Agregamos la ruta del backend al path para poder importar la app
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.db.session import SessionLocal
from app.models.academica import Asignatura

db = SessionLocal()

cambios = {
    "MA": {"codigo": "MAT", "nombre": "Matemática", "abreviatura": "Matemática", "orden": 4},
    "CN": {"codigo": "CNF", "nombre": "Ciencias de la Naturaleza: Física", "abreviatura": "Física", "orden": 6},
    "ING": {"codigo": "LEI", "nombre": "Lenguas Extranjeras: Inglés", "abreviatura": "Inglés", "orden": 2},
    "FRA": {"codigo": "LEF", "nombre": "Lenguas Extranjeras: Francés", "abreviatura": "Francés", "orden": 3},
    "LE": {"nombre": "Lengua Española", "abreviatura": "L. Española", "orden": 1},
    "CS": {"nombre": "Ciencias Sociales", "abreviatura": "C. Sociales", "orden": 5},
    "EA": {"nombre": "Educación Artística", "abreviatura": "Ed. Artística", "orden": 7},
    "EF": {"nombre": "Educación Física", "abreviatura": "Ed. Física", "orden": 8},
    "FIHR": {"nombre": "Formación Integral Humana y Religiosa", "abreviatura": "F.I.H.R", "orden": 9}
}

for codigo_viejo, valores_nuevos in cambios.items():
    asig = db.query(Asignatura).filter(Asignatura.codigo == codigo_viejo).first()
    if asig:
        for k, v in valores_nuevos.items():
            setattr(asig, k, v)

# Asegurar que exista "SO"
so = db.query(Asignatura).filter(Asignatura.codigo == "SO").first()
if not so:
    so = Asignatura(codigo="SO", nombre="Salida Optativa", abreviatura="Optativa", orden=10, es_activa=True)
    db.add(so)

db.commit()
db.close()
print("Asignaturas actualizadas correctamente con las nuevas siglas.")
