from app.db.session import SessionLocal
from sqlalchemy import text
db = SessionLocal()
db.execute(text('ALTER TABLE grupo_competencia ALTER COLUMN grado_id DROP NOT NULL'))
db.commit()
