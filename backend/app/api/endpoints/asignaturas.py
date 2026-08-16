from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import SessionLocal
from app.models import Asignatura
from app.schemas.academica import AsignaturaCreate, AsignaturaUpdate, AsignaturaResponse
from app.models.academica import Grado
from app.models.competencias import CompetenciaEspecifica, GrupoCompetencia, GrupoCompetenciaDetalle
from app.schemas.competencias import GrupoCompetenciaResponse
from app.api.deps import get_current_user, get_current_active_centro, get_current_active_superuser

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[AsignaturaResponse])
def listar_asignaturas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    """
    Obtiene la lista de todas las asignaturas.
    """
    return db.query(Asignatura).filter(Asignatura.centro_id == centro_id).order_by(Asignatura.orden).offset(skip).limit(limit).all()


@router.post("/", response_model=AsignaturaResponse, status_code=status.HTTP_201_CREATED)
def crear_asignatura(
    asignatura_in: AsignaturaCreate,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    """
    Crea una nueva asignatura. Solo administradores.
    """
    if db.query(Asignatura).filter(Asignatura.codigo == asignatura_in.codigo, Asignatura.centro_id == centro_id).first():
        raise HTTPException(
            status_code=400,
            detail="Ya existe una asignatura con este código en el centro."
        )
    
    db_obj = Asignatura(**asignatura_in.model_dump(), centro_id=centro_id)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Auto-sembrar competencias específicas y grupos plantilla para la nueva asignatura
    from app.models.competencias import CompetenciaEspecifica, GrupoCompetencia, GrupoCompetenciaDetalle
    
    comps_dict = {}
    for i in range(1, 8):
        codigo_ce = f"CE-{db_obj.codigo}{i}"
        nueva_ce = CompetenciaEspecifica(
            codigo=codigo_ce,
            nombre=f"Competencia Específica {i}",
            orden=i,
            asignatura_id=db_obj.id
        )
        db.add(nueva_ce)
        db.flush()
        comps_dict[i] = nueva_ce.id

    # Grupos MINERD Estándar (4 bloques según manual - Capítulo 2)
    grupos_minerd = [
        {"nombre": "Competencia Comunicativa", "peso": 25.0, "orden": 1, "comps": [1]}, # CE1
        {"nombre": "Pensamiento Lógico, Creativo y Crítico; y Resolución de Problemas", "peso": 25.0, "orden": 2, "comps": [2, 3]}, # CE2, CE3
        {"nombre": "Ética y Ciudadana; y Desarrollo Personal y Espiritual", "peso": 25.0, "orden": 3, "comps": [4, 7]}, # CE4, CE7
        {"nombre": "Científica y Tecnológica; y Ambiental y de la Salud", "peso": 25.0, "orden": 4, "comps": [5, 6]} # CE5, CE6
    ]  
    for grp in grupos_minerd:
        nuevo_grupo = GrupoCompetencia(
            asignatura_id=db_obj.id,
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
    
    return db_obj


@router.put("/{asignatura_id}", response_model=AsignaturaResponse)
def actualizar_asignatura(
    asignatura_id: int,
    asignatura_in: AsignaturaUpdate,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    """
    Actualiza una asignatura existente. Solo administradores.
    """
    db_obj = db.query(Asignatura).filter(Asignatura.id == asignatura_id, Asignatura.centro_id == centro_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Asignatura no encontrada")
    
    # Check duplicate code
    if asignatura_in.codigo != db_obj.codigo:
        if db.query(Asignatura).filter(Asignatura.codigo == asignatura_in.codigo, Asignatura.centro_id == centro_id).first():
            raise HTTPException(status_code=400, detail="El código ya está en uso en este centro.")
            
    for field, value in asignatura_in.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)
        
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.delete("/{asignatura_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_asignatura(
    asignatura_id: int,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    """
    Elimina una asignatura. Solo administradores.
    """
    db_obj = db.query(Asignatura).filter(Asignatura.id == asignatura_id, Asignatura.centro_id == centro_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Asignatura no encontrada")
    
    # Borrar asignaciones a grados
    from app.models.academica import GradoAsignatura
    db.query(GradoAsignatura).filter(GradoAsignatura.asignatura_id == asignatura_id).delete(synchronize_session=False)

    # Borrar grupos de competencias
    from app.models.competencias import GrupoCompetencia, GrupoCompetenciaDetalle, CompetenciaEspecifica
    
    grupos = db.query(GrupoCompetencia).filter(GrupoCompetencia.asignatura_id == asignatura_id).all()
    grupo_ids = [g.id for g in grupos]
    if grupo_ids:
        db.query(GrupoCompetenciaDetalle).filter(GrupoCompetenciaDetalle.grupo_competencia_id.in_(grupo_ids)).delete(synchronize_session=False)
        db.query(GrupoCompetencia).filter(GrupoCompetencia.asignatura_id == asignatura_id).delete(synchronize_session=False)

    # Borrar competencias específicas
    db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.asignatura_id == asignatura_id).delete(synchronize_session=False)

    db.delete(db_obj)
    db.commit()

@router.post("/sembrar-competencias", status_code=status.HTTP_200_OK)
def sembrar_competencias(
    db: Session = Depends(get_db)
):
    """
    Siembra competencias específicas (CE1-CE7) y grupos de competencias (Plantillas) 
    para todas las asignaturas que aún no los tienen configurados.
    """
    from app.models.competencias import CompetenciaEspecifica, GrupoCompetencia, GrupoCompetenciaDetalle
    asignaturas = db.query(Asignatura).all()
    count = 0
    for asig in asignaturas:
        # 1. Crear / Corregir Competencias Específicas
        comps_existentes = db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.asignatura_id == asig.id).order_by(CompetenciaEspecifica.orden).all()
        comps_dict = {}
        if not comps_existentes:
            for i in range(1, 8):
                codigo_ce = f"CE-{asig.codigo}{i}"
                nueva_ce = CompetenciaEspecifica(
                    codigo=codigo_ce,
                    nombre=f"Competencia Específica {i}",
                    orden=i,
                    asignatura_id=asig.id
                )
                db.add(nueva_ce)
            db.commit()
            comps_existentes = db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.asignatura_id == asig.id).order_by(CompetenciaEspecifica.orden).all()
        else:
            # Corregir códigos con formato viejo (CE{i}-{codigo})
            for ce in comps_existentes:
                codigo_correcto = f"CE-{asig.codigo}{ce.orden}"
                if ce.codigo != codigo_correcto:
                    ce.codigo = codigo_correcto
            db.commit()
        
        for ce in comps_existentes:
            comps_dict[ce.orden] = ce.id
            
        # 2. Crear Grupos de Competencias (Plantillas)
        grupos_existentes = db.query(GrupoCompetencia).filter(
            GrupoCompetencia.asignatura_id == asig.id,
            GrupoCompetencia.grado_id == None
        ).all()
        
        # Eliminar si existen para refrescar la configuración
        if grupos_existentes:
            grupo_ids = [g.id for g in grupos_existentes]
            db.query(GrupoCompetenciaDetalle).filter(GrupoCompetenciaDetalle.grupo_competencia_id.in_(grupo_ids)).delete(synchronize_session=False)
            db.query(GrupoCompetencia).filter(GrupoCompetencia.id.in_(grupo_ids)).delete(synchronize_session=False)
            db.commit()

        # Grupos MINERD Estándar (4 bloques según manual - Capítulo 2)
        grupos_minerd = [
            {"nombre": "Competencia Comunicativa", "peso": 25.0, "orden": 1, "comps": [1]}, # CE1
            {"nombre": "Pensamiento Lógico, Creativo y Crítico; y Resolución de Problemas", "peso": 25.0, "orden": 2, "comps": [2, 3]}, # CE2, CE3
            {"nombre": "Ética y Ciudadana; y Desarrollo Personal y Espiritual", "peso": 25.0, "orden": 3, "comps": [4, 7]}, # CE4, CE7
            {"nombre": "Científica y Tecnológica; y Ambiental y de la Salud", "peso": 25.0, "orden": 4, "comps": [5, 6]} # CE5, CE6
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
        count += 1
            
    return {"message": f"Seeding completado. Asignaturas actualizadas: {count}"}


@router.post("/seed-minerd", response_model=List[AsignaturaResponse])
def inicializar_asignaturas_minerd(
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    """
    Inserta de una vez todas las asignaturas que establece la modalidad académica.
    Accesible para superusuario y administrador del centro.
    """
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

    for asig in asignaturas_minerd:
        existente = db.query(Asignatura).filter(
            Asignatura.codigo == asig["codigo"],
            Asignatura.centro_id == centro_id
        ).first()
        if existente:
            existente.nombre = asig["nombre"]
            existente.abreviatura = asig["abreviatura"]
            existente.orden = asig["orden"]
        else:
            nueva = Asignatura(**asig, centro_id=centro_id)
            db.add(nueva)

    db.commit()

    # Generar Competencias y Grupos para cada asignatura de este centro
    todas_asignaturas = db.query(Asignatura).filter(Asignatura.centro_id == centro_id).all()

    for asig in todas_asignaturas:
        codigo_asig = asig.codigo

        # 1. Crear las 7 competencias específicas
        competencias = {}
        for i in range(1, 8):
            codigo_ce = f"CE-{codigo_asig}{i}"
            ce = db.query(CompetenciaEspecifica).filter_by(asignatura_id=asig.id, codigo=codigo_ce).first()
            if not ce:
                ce = CompetenciaEspecifica(
                    asignatura_id=asig.id,
                    codigo=codigo_ce,
                    nombre=f"Competencia Específica {i}",
                    descripcion=f"Competencia Específica {i} para {asig.nombre}",
                    orden=i,
                    es_activa=True
                )
                db.add(ce)
                db.flush()
            competencias[i] = ce

        # 2. Crear los 4 grupos de competencia plantilla (grado_id = None)
        grupos_definicion = [
            {"nombre": "Grupo 1: Comunicativa", "desc": "Competencia Específica 1", "orden": 1, "comps": [1]},
            {"nombre": "Grupo 2: Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas", "desc": "Competencias 2 y 3 combinadas", "orden": 2, "comps": [2, 3]},
            {"nombre": "Grupo 3: Ética y Ciudadana; Desarrollo Personal y Espiritual", "desc": "Competencias 4 y 7 combinadas", "orden": 3, "comps": [4, 7]},
            {"nombre": "Grupo 4: Ambiental y de la Salud; Científica y Tecnológica", "desc": "Competencias 5 y 6 combinadas", "orden": 4, "comps": [5, 6]},
        ]

        for g_def in grupos_definicion:
            grupo = db.query(GrupoCompetencia).filter_by(
                asignatura_id=asig.id, grado_id=None, nombre_grupo=g_def["nombre"]
            ).first()

            if not grupo:
                grupo = GrupoCompetencia(
                    asignatura_id=asig.id, grado_id=None, nombre_grupo=g_def["nombre"],
                    descripcion=g_def["desc"], peso_porcentaje=25.00, orden=g_def["orden"], es_activo=True
                )
                db.add(grupo)
                db.flush()

            for comp_idx in g_def["comps"]:
                ce = competencias[comp_idx]
                detalle = db.query(GrupoCompetenciaDetalle).filter_by(
                    grupo_competencia_id=grupo.id, competencia_id=ce.id
                ).first()

                if not detalle:
                    detalle = GrupoCompetenciaDetalle(
                        grupo_competencia_id=grupo.id, competencia_id=ce.id, peso=1.00
                    )
                    db.add(detalle)
                    db.flush()
        db.commit()

    # Devolver asignaturas del centro
    return db.query(Asignatura).filter(Asignatura.centro_id == centro_id).order_by(Asignatura.orden).all()

@router.get("/{id}/grupos-plantilla", response_model=List[GrupoCompetenciaResponse])
def obtener_grupos_plantilla(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    asignatura = db.query(Asignatura).filter(Asignatura.id == id).first()
    if not asignatura:
        raise HTTPException(status_code=404, detail="Asignatura no encontrada")
        
    grupos = db.query(GrupoCompetencia).filter(
        GrupoCompetencia.asignatura_id == id,
        GrupoCompetencia.grado_id == None
    ).order_by(GrupoCompetencia.orden).all()
    
    # Cargar las competencias específicas para la respuesta
    for grupo in grupos:
        detalles = db.query(GrupoCompetenciaDetalle).filter(GrupoCompetenciaDetalle.grupo_competencia_id == grupo.id).all()
        comps = []
        for det in detalles:
            ce = db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.id == det.competencia_id).first()
            if ce:
                comps.append(ce)
        setattr(grupo, "competencias_especificas", comps)
        
    return grupos
