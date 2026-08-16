from app.db.session import SessionLocal
from app.models.competencias import GrupoCompetencia, GrupoCompetenciaDetalle
db = SessionLocal()
try:
    # Obtener todos los grupos plantilla
    grupos = db.query(GrupoCompetencia).filter(GrupoCompetencia.grado_id == None).all()
    grupo_ids = [g.id for g in grupos]
    if grupo_ids:
        # Borrar detalles
        db.query(GrupoCompetenciaDetalle).filter(GrupoCompetenciaDetalle.grupo_competencia_id.in_(grupo_ids)).delete(synchronize_session=False)
        # Borrar grupos
        db.query(GrupoCompetencia).filter(GrupoCompetencia.id.in_(grupo_ids)).delete(synchronize_session=False)
        db.commit()
        print('Plantillas borradas con exito.')
except Exception as e:
    print(f'Error: {e}')
    db.rollback()
finally:
    db.close()
