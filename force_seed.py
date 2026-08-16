import sys
import os
from dotenv import load_dotenv

# Cargar variables de entorno (DB credentials)
load_dotenv(os.path.join(os.path.dirname(__file__), "backend", ".env"))

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.db.session import SessionLocal
from app.models import Asignatura

db = SessionLocal()

asignaturas_minerd = [
    {"codigo": "LE", "nombre": "Lengua Española", "abreviatura": "L. Española", "orden": 1},
    {"codigo": "LEI", "nombre": "Lenguas Extranjeras: Inglés", "abreviatura": "Inglés", "orden": 2},
    {"codigo": "LEF", "nombre": "Lenguas Extranjeras: Francés", "abreviatura": "Francés", "orden": 3},
    {"codigo": "MAT", "nombre": "Matemática", "abreviatura": "Matemática", "orden": 4},
    {"codigo": "CS", "nombre": "Ciencias Sociales", "abreviatura": "C. Sociales", "orden": 5},
    {"codigo": "CNF", "nombre": "Ciencias de la Naturaleza: Física", "abreviatura": "Física", "orden": 6},
    {"codigo": "EA", "nombre": "Educación Artística", "abreviatura": "Ed. Artística", "orden": 7},
    {"codigo": "EF", "nombre": "Educación Física", "abreviatura": "Ed. Física", "orden": 8},
    {"codigo": "FIHR", "nombre": "Formación Integral Humana y Religiosa", "abreviatura": "F.I.H.R", "orden": 9},
    {"codigo": "SO", "nombre": "Salida Optativa", "abreviatura": "Optativa", "orden": 10}
]

# Migrar códigos antiguos si existen
mapeo_codigos = {
    "MA": "MAT",
    "CN": "CNF",
    "ING": "LEI",
    "FRA": "LEF",
}

for viejo, nuevo in mapeo_codigos.items():
    asig = db.query(Asignatura).filter(Asignatura.codigo == viejo).first()
    if asig:
        asig.codigo = nuevo

db.commit()

for asig in asignaturas_minerd:
    existente = db.query(Asignatura).filter(Asignatura.codigo == asig["codigo"]).first()
    if existente:
        existente.nombre = asig["nombre"]
        existente.abreviatura = asig["abreviatura"]
        existente.orden = asig["orden"]
    else:
        nueva = Asignatura(**asig)
        db.add(nueva)

db.commit()
db.close()
print("Asignaturas sembradas e insertadas correctamente desde el script.")
