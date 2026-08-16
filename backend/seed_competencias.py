from app.db.session import SessionLocal
from app.models.academica import Asignatura
from app.models.competencias import CompetenciaEspecifica, GrupoCompetencia, GrupoCompetenciaDetalle

def seed():
    db = SessionLocal()
    try:
        asignaturas = db.query(Asignatura).all()
        for asig in asignaturas:
            print(f"Seeding {asig.nombre}...")
            
            # 1. Crear Competencias Específicas
            comps_existentes = db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.asignatura_id == asig.id).all()
            comps_dict = {}
            if not comps_existentes:
                for i in range(1, 8):
                    codigo_ce = f"CE{i}-{asig.codigo}"
                    nueva_ce = CompetenciaEspecifica(
                        codigo=codigo_ce,
                        nombre=f"Competencia Específica {i}",
                        orden=i,
                        asignatura_id=asig.id
                    )
                    db.add(nueva_ce)
                db.commit()
                comps_existentes = db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.asignatura_id == asig.id).order_by(CompetenciaEspecifica.orden).all()
            
            for ce in comps_existentes:
                comps_dict[ce.orden] = ce.id
                
            # 2. Crear Grupos de Competencias (Plantillas)
            grupos_existentes = db.query(GrupoCompetencia).filter(
                GrupoCompetencia.asignatura_id == asig.id,
                GrupoCompetencia.grado_id == None
            ).all()
            
            if not grupos_existentes:
                # Grupos MINERD Estándar
                grupos_minerd = [
                    {"nombre": "Comunicativa", "peso": 33.33, "orden": 1, "comps": [1]}, # CE1
                    {"nombre": "Pensamiento Lógico, Crítico y Creativo", "peso": 33.33, "orden": 2, "comps": [2, 3]}, # CE2, CE3
                    {"nombre": "Resolución de Problemas y Científica", "peso": 33.34, "orden": 3, "comps": [4, 5, 6, 7]} # CE4, CE5, CE6, CE7
                ]
                
                for grp in grupos_minerd:
                    nuevo_grupo = GrupoCompetencia(
                        asignatura_id=asig.id,
                        grado_id=None,
                        nombre_grupo=grp["nombre"],
                        peso_porcentaje=grp["peso"],
                        orden=grp["orden"]
                    )
                    db.add(nuevo_grupo)
                    db.flush()
                    
                    for ce_orden in grp["comps"]:
                        ce_id = comps_dict.get(ce_orden)
                        if ce_id:
                            detalle = GrupoCompetenciaDetalle(
                                grupo_competencia_id=nuevo_grupo.id,
                                competencia_id=ce_id,
                                peso=1.0
                            )
                            db.add(detalle)
                db.commit()
        print("Done!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
