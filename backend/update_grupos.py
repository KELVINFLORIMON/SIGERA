from app.db.session import SessionLocal
from app.models.competencias import GrupoCompetencia

db = SessionLocal()

mapping = {
    'Grupo 1': 'Grupo 1: Comunicativa',
    'Grupo 2': 'Grupo 2: Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas',
    'Grupo 3': 'Grupo 3: Ética y Ciudadana; Desarrollo Personal y Espiritual',
    'Grupo 4': 'Grupo 4: Ambiental y de la Salud; Científica y Tecnológica'
}

for old, new_val in mapping.items():
    grupos = db.query(GrupoCompetencia).filter(GrupoCompetencia.nombre_grupo == old).all()
    for g in grupos:
        g.nombre_grupo = new_val
    print(f'Actualizados {len(grupos)} grupos de {old}')
db.commit()
print('Listo!')
