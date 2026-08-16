from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import SessionLocal
from app.models.academica import GradoAsignatura, Asignatura, Grado
from app.models.competencias import GrupoCompetencia, GrupoCompetenciaDetalle, CompetenciaEspecifica
from app.schemas.competencias import (
    GradoAsignaturaCreate, GradoAsignaturaResponse,
    GrupoCompetenciaCreate, GrupoCompetenciaResponse,
    CompetenciaEspecificaCreate, CompetenciaEspecificaResponse
)
from app.api.deps import get_current_user, get_current_active_centro

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --------------------------
# Grado - Asignatura
# --------------------------
@router.get("/grado/{grado_id}/asignaturas", response_model=List[dict])
def listar_asignaturas_por_grado(
    grado_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Lista las asignaturas asignadas a un grado, incluyendo los grupos de competencia.
    Devuelve un diccionario porque mapeamos relaciones manualmente para mayor flexibilidad.
    """
    grado_asignaturas = db.query(GradoAsignatura).filter(GradoAsignatura.grado_id == grado_id).all()
    
    result = []
    for ga in grado_asignaturas:
        asignatura = db.query(Asignatura).filter(Asignatura.id == ga.asignatura_id).first()
        if not asignatura:
            continue
            
        grupos_db = db.query(GrupoCompetencia).filter(
            GrupoCompetencia.grado_id == grado_id,
            GrupoCompetencia.asignatura_id == ga.asignatura_id
        ).all()
        
        grupos = []
        for g in grupos_db:
            detalles = db.query(GrupoCompetenciaDetalle).filter(GrupoCompetenciaDetalle.grupo_competencia_id == g.id).all()
            comps = []
            for d in detalles:
                ce = db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.id == d.competencia_id).first()
                if ce:
                    comps.append({
                        "id": ce.id,
                        "codigo": ce.codigo,
                        "nombre": ce.nombre,
                        "descripcion": ce.descripcion,
                        "orden": ce.orden,
                        "es_activa": ce.es_activa,
                        "asignatura_id": ce.asignatura_id
                    })
            
            grupos.append({
                "id": g.id,
                "nombre_grupo": g.nombre_grupo,
                "descripcion": g.descripcion,
                "orden": g.orden,
                "peso_porcentaje": g.peso_porcentaje,
                "asignatura_id": g.asignatura_id,
                "grado_id": g.grado_id,
                "es_activo": g.es_activo,
                "competencias_especificas": comps
            })
            
        result.append({
            "id": ga.id,
            "grado_id": ga.grado_id,
            "asignatura_id": ga.asignatura_id,
            "creditos": ga.creditos,
            "horas_semana": ga.horas_semana,
            "es_activa": ga.es_activa,
            "asignatura_codigo": asignatura.codigo,
            "asignatura_nombre": asignatura.nombre,
            "asignatura_orden": asignatura.orden,
            "grupos_competencia": grupos
        })
        
    return result

@router.post("/grado-asignatura", response_model=GradoAsignaturaResponse, status_code=status.HTTP_201_CREATED)
def agregar_asignatura_a_grado(
    ga_in: GradoAsignaturaCreate,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    # Check if already exists
    existente = db.query(GradoAsignatura).filter(
        GradoAsignatura.grado_id == ga_in.grado_id,
        GradoAsignatura.asignatura_id == ga_in.asignatura_id
    ).first()
    
    if existente:
        raise HTTPException(status_code=400, detail="Esta asignatura ya está agregada al grado.")
        
    db_obj = GradoAsignatura(**ga_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    asignatura = db.query(Asignatura).filter(Asignatura.id == db_obj.asignatura_id).first()
    
    # === AUTO-GENERACIÓN DE COMPETENCIAS Y GRUPOS ===
    if asignatura:
        # Verificar si las competencias específicas ya existen para la asignatura
        comps_existentes = db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.asignatura_id == asignatura.id).all()
        if not comps_existentes:
            # Generar CE1 a CE7
            for i in range(1, 8):
                codigo_ce = f"CE{i}-{asignatura.codigo}"
                nueva_ce = CompetenciaEspecifica(
                    codigo=codigo_ce,
                    nombre=f"Competencia Específica {i}",
                    orden=i,
                    asignatura_id=asignatura.id
                )
                db.add(nueva_ce)
            db.commit()
            comps_existentes = db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.asignatura_id == asignatura.id).order_by(CompetenciaEspecifica.orden).all()
        
        # Verificar si los grupos ya existen para este grado y asignatura
        grupos_existentes = db.query(GrupoCompetencia).filter(
            GrupoCompetencia.grado_id == ga_in.grado_id,
            GrupoCompetencia.asignatura_id == ga_in.asignatura_id
        ).all()
        
        if not grupos_existentes and comps_existentes:
            # Buscar si la asignatura tiene grupos configurados como plantilla (grado_id = None)
            grupos_plantilla = db.query(GrupoCompetencia).filter(
                GrupoCompetencia.asignatura_id == asignatura.id,
                GrupoCompetencia.grado_id == None
            ).all()

            for grp_plantilla in grupos_plantilla:
                nuevo_grupo = GrupoCompetencia(
                    nombre_grupo=grp_plantilla.nombre_grupo,
                    descripcion=grp_plantilla.descripcion,
                    peso_porcentaje=grp_plantilla.peso_porcentaje,
                    orden=grp_plantilla.orden,
                    asignatura_id=asignatura.id,
                    grado_id=ga_in.grado_id,
                    es_activo=grp_plantilla.es_activo
                )
                db.add(nuevo_grupo)
                db.flush()
                
                detalles_plantilla = db.query(GrupoCompetenciaDetalle).filter(
                    GrupoCompetenciaDetalle.grupo_competencia_id == grp_plantilla.id
                ).all()
                
                for det in detalles_plantilla:
                    nuevo_detalle = GrupoCompetenciaDetalle(
                        grupo_competencia_id=nuevo_grupo.id,
                        competencia_id=det.competencia_id,
                        peso=det.peso
                    )
                    db.add(nuevo_detalle)
            db.commit()

    # Recargar para incluir los grupos en la respuesta
    return {
        "id": db_obj.id,
        "grado_id": db_obj.grado_id,
        "asignatura_id": db_obj.asignatura_id,
        "creditos": db_obj.creditos,
        "horas_semana": db_obj.horas_semana,
        "es_activa": db_obj.es_activa,
        "asignatura_codigo": asignatura.codigo if asignatura else "",
        "asignatura_nombre": asignatura.nombre if asignatura else "",
        "grupos_competencia": [] # El frontend recargará igual toda la vista
    }

@router.delete("/grado-asignatura/{id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_asignatura_de_grado(
    id: int,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    db_obj = db.query(GradoAsignatura).filter(GradoAsignatura.id == id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
        
    # Eliminar los grupos de competencia asociados a esta asignatura en este grado
    db.query(GrupoCompetencia).filter(
        GrupoCompetencia.grado_id == db_obj.grado_id,
        GrupoCompetencia.asignatura_id == db_obj.asignatura_id
    ).delete()
        
    db.delete(db_obj)
    db.commit()

# --------------------------
# Grupos de Competencia
# --------------------------
@router.post("/grupos", response_model=GrupoCompetenciaResponse, status_code=status.HTTP_201_CREATED)
def crear_grupo_competencia(
    grupo_in: GrupoCompetenciaCreate,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    # 1. Validar que el total no pase de 100
    grupos_actuales = db.query(GrupoCompetencia).filter(
        GrupoCompetencia.grado_id == grupo_in.grado_id,
        GrupoCompetencia.asignatura_id == grupo_in.asignatura_id
    ).all()
    
    suma_actual = sum([g.peso_porcentaje for g in grupos_actuales])
    if suma_actual + grupo_in.peso_porcentaje > 100:
        raise HTTPException(status_code=400, detail=f"El porcentaje total superaría el 100%. Disponible: {100 - suma_actual}%")

    # 2. Crear Grupo
    grupo_dict = grupo_in.model_dump(exclude={"competencias_ids"})
    db_obj = GrupoCompetencia(**grupo_dict)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # 3. Vincular las competencias específicas si se enviaron
    comps_response = []
    if grupo_in.competencias_ids:
        for c_id in grupo_in.competencias_ids:
            detalle = GrupoCompetenciaDetalle(
                grupo_competencia_id=db_obj.id,
                competencia_id=c_id,
                peso=1.0 # default
            )
            db.add(detalle)
            ce = db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.id == c_id).first()
            if ce:
                comps_response.append(ce)
        db.commit()

    return {
        **db_obj.__dict__,
        "competencias_especificas": comps_response
    }

@router.delete("/grupos/{grupo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_grupo_competencia(
    grupo_id: int,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    db_obj = db.query(GrupoCompetencia).filter(GrupoCompetencia.id == grupo_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Grupo de competencia no encontrado")
        
    db.delete(db_obj)
    db.commit()

# --------------------------
# Competencias Específicas
# --------------------------
@router.get("/especificas/{asignatura_id}", response_model=List[CompetenciaEspecificaResponse])
def listar_competencias_especificas(
    asignatura_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(CompetenciaEspecifica).filter(CompetenciaEspecifica.asignatura_id == asignatura_id).order_by(CompetenciaEspecifica.orden).all()

@router.post("/especificas", response_model=CompetenciaEspecificaResponse, status_code=status.HTTP_201_CREATED)
def crear_competencia_especifica(
    comp_in: CompetenciaEspecificaCreate,
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user = Depends(get_current_user)
):
    db_obj = CompetenciaEspecifica(**comp_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
