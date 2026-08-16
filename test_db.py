import sys
sys.path.append(".")
from app.db.session import SessionLocal

db = SessionLocal()
dialect = db.get_bind().dialect.name
print("Database Dialect:", dialect)

if dialect == "postgresql":
    # Try inserting directly to catch the error
    from app.models.institucional import CentroEducativo
    try:
        centro = CentroEducativo(distrito_id=1, codigo_minerd="123", nombre="Test", tanda_principal="JEE", modalidad="ACADEMICA")
        db.add(centro)
        db.commit()
    except Exception as e:
        print("Insert Error:", e)
