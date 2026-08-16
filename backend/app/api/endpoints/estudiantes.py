from typing import Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from datetime import date

from app.api import deps
from app.models.seguridad import Usuario
from app.models.personas import Estudiante, EstudianteSeccion
from app.schemas.estudiante import EstudianteCreate, EstudianteUpdate, EstudianteResponse
from app.api.deps import get_current_user, get_current_active_superuser, get_current_active_centro

router = APIRouter()

@router.get("/", response_model=List[EstudianteResponse])
def get_estudiantes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    anio_escolar_id: Optional[int] = None,
    centro_id: int = Depends(get_current_active_centro),
    current_user: Usuario = Depends(get_current_user)
) -> Any:
    """
    Obtener todos los estudiantes. Los superusuarios ven todos los estudiantes de todos los centros.
    Incluye los inactivos (se filtran en el frontend).
    """
    query = db.query(Estudiante).options(
        selectinload(Estudiante.secciones),
        selectinload(Estudiante.representantes)
    )
    
    if not current_user.es_superusuario:
        query = query.filter(Estudiante.centro_id == centro_id)
        
    if anio_escolar_id:
        query = query.join(EstudianteSeccion).filter(EstudianteSeccion.anio_escolar_id == anio_escolar_id)
        
    estudiantes = query.offset(skip).limit(limit).all()
    
    # Obtener asignaturas en recuperación si se filtró por año escolar
    if anio_escolar_id:
        from app.models.evaluacion import CalificacionAsignatura, CalificacionGrupo
        from app.models.academica import Asignatura
        from app.models.enums import SituacionFinalTipo
        
        seccion_ids = [s.id for est in estudiantes for s in est.secciones if s.anio_escolar_id == anio_escolar_id]
        
        if seccion_ids:
            recs = db.query(CalificacionAsignatura, Asignatura.codigo, CalificacionGrupo)\
                .join(Asignatura, CalificacionAsignatura.asignatura_id == Asignatura.id)\
                .outerjoin(CalificacionGrupo, CalificacionGrupo.calificacion_asignatura_id == CalificacionAsignatura.id)\
                .filter(
                    CalificacionAsignatura.estudiante_seccion_id.in_(seccion_ids)
                ).all()
            
            calif_groups = {}
            sit_map = {}
            rec_map = {}
            
            for calif, codigo, grupo in recs:
                if calif.id not in calif_groups:
                    calif_groups[calif.id] = {'calif': calif, 'codigo': codigo, 'grupos': []}
                if grupo:
                    calif_groups[calif.id]['grupos'].append(grupo)
                    
            for c_id, data in calif_groups.items():
                calif = data['calif']
                codigo = data['codigo']
                grupos = data['grupos']
                
                est_sec_id = calif.estudiante_seccion_id
                if est_sec_id not in sit_map:
                    sit_map[est_sec_id] = {}
                    rec_map[est_sec_id] = []
                
                sit_value = None
                
                if calif.situacion_final and calif.situacion_final in (SituacionFinalTipo.EN_COMPLETIVA, SituacionFinalTipo.EN_EXTRAORDINARIA, SituacionFinalTipo.EVALUACION_ESPECIAL):
                    sit_value = "RECUPERACION"
                elif calif.situacion_final and calif.situacion_final in (SituacionFinalTipo.APROBADO, SituacionFinalTipo.REPROBADO):
                    sit_value = calif.situacion_final.value
                else:
                    en_recuperacion = False
                    for g in grupos:
                        if (g.nota_p1 is not None and g.nota_p1 < 70) or \
                           (g.nota_p2 is not None and g.nota_p2 < 70) or \
                           (g.nota_p3 is not None and g.nota_p3 < 70) or \
                           (g.nota_p4 is not None and g.nota_p4 < 70):
                            en_recuperacion = True
                            break
                    
                    if en_recuperacion:
                        sit_value = "RECUPERACION"
                    else:
                        sit_value = "EVALUACION"
                
                sit_map[est_sec_id][codigo] = sit_value
                    
                if sit_value == "RECUPERACION":
                    rec_map[est_sec_id].append(codigo)
                
            for est in estudiantes:
                for sec in est.secciones:
                    setattr(sec, 'asignaturas_en_recuperacion', rec_map.get(sec.id, []))
                    setattr(sec, 'situaciones_asignaturas', sit_map.get(sec.id, {}))
                    
    return estudiantes
@router.post("/", response_model=EstudianteResponse)
def create_estudiante(
    *,
    db: Session = Depends(deps.get_db),
    estudiante_in: EstudianteCreate,
    centro_id: int = Depends(get_current_active_centro)
) -> Any:
    """
    Crear nuevo estudiante y asignarlo a una sección si se provee.
    El estudiante se creará en el centro activo del usuario.
    """
    # Forzar el centro ID de la sesión
    estudiante_in.centro_id = centro_id
    estudiante = db.query(Estudiante).filter(Estudiante.rne == estudiante_in.rne, Estudiante.centro_id == centro_id).first()
    if estudiante:
        raise HTTPException(
            status_code=400,
            detail="El estudiante con este RNE ya existe en el sistema.",
        )
        
    db_est = Estudiante(
        rne=estudiante_in.rne,
        cedula=estudiante_in.cedula,
        primer_nombre=estudiante_in.primer_nombre,
        segundo_nombre=estudiante_in.segundo_nombre,
        primer_apellido=estudiante_in.primer_apellido,
        segundo_apellido=estudiante_in.segundo_apellido,
        sexo=estudiante_in.sexo,
        fecha_nacimiento=estudiante_in.fecha_nacimiento,
        correo=estudiante_in.correo,
        telefono=estudiante_in.telefono,
        centro_id=estudiante_in.centro_id
    )
    db.add(db_est)
    db.commit()
    db.refresh(db_est)
    
    # Si se especificó sección y año, hacer la asignación
    if estudiante_in.seccion_id and estudiante_in.anio_escolar_id:
        from app.models.enums import EstadoEstudianteTipo, CondicionInicialTipo
        # Buscar el último número de orden
        ultimo = db.query(EstudianteSeccion).filter(
            EstudianteSeccion.seccion_id == estudiante_in.seccion_id,
            EstudianteSeccion.anio_escolar_id == estudiante_in.anio_escolar_id
        ).order_by(EstudianteSeccion.numero_orden.desc()).first()
        
        nuevo_orden = (ultimo.numero_orden + 1) if ultimo else 1
        
        est_sec = EstudianteSeccion(
            estudiante_id=db_est.id,
            seccion_id=estudiante_in.seccion_id,
            anio_escolar_id=estudiante_in.anio_escolar_id,
            numero_orden=nuevo_orden,
            condicion_inicial=CondicionInicialTipo.NUEVO,
            estado=EstadoEstudianteTipo.ACTIVO,
            fecha_ingreso=date.today()
        )
        db.add(est_sec)
        db.commit()
        
    return db_est

@router.put("/{id}", response_model=EstudianteResponse)
def update_estudiante(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    estudiante_in: EstudianteUpdate,
    centro_id: int = Depends(get_current_active_centro),
    current_user: Usuario = Depends(get_current_user)
) -> Any:
    """
    Actualizar estudiante. Si el estudiante estaba inactivo, al actualizarlo se reactiva.
    """
    query = db.query(Estudiante).filter(Estudiante.id == id)
    if not current_user.es_superusuario:
        query = query.filter(Estudiante.centro_id == centro_id)
        
    estudiante = query.first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado en su centro")
        
    update_data = estudiante_in.model_dump(exclude_unset=True)
    
    if not current_user.es_superusuario and 'centro_id' in update_data:
        # Prevent normal admins from changing the center
        del update_data['centro_id']
        
    for field, value in update_data.items():
        setattr(estudiante, field, value)
        
    # Reactivar el estudiante
    estudiante.es_activo = True
        
    db.add(estudiante)
    db.commit()
    db.refresh(estudiante)
    return estudiante

@router.delete("/{id}")
def delete_estudiante(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    centro_id: int = Depends(get_current_active_centro),
    current_user: Usuario = Depends(get_current_user)
) -> Any:
    """
    Borrado lógico de estudiante (marcar como inactivo y desasignar del centro).
    """
    query = db.query(Estudiante).filter(Estudiante.id == id)
    if not current_user.es_superusuario:
        query = query.filter(Estudiante.centro_id == centro_id)
        
    estudiante = query.first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado en su centro")
        
    # Cambiar estado del estudiante en la sección a inactivo en vez de borrarlo, o simplemente borrar la asignación actual
    from app.models.personas import EstudianteSeccion
    from app.models.enums import EstadoEstudianteTipo
    
    secciones_activas = db.query(EstudianteSeccion).filter(
        EstudianteSeccion.estudiante_id == id,
        EstudianteSeccion.estado == EstadoEstudianteTipo.ACTIVO
    ).all()
    
    for sec in secciones_activas:
        sec.estado = EstadoEstudianteTipo.RETIRADO
        
    # Desactivar estudiante y quitar centro_id
    estudiante.es_activo = False
    estudiante.centro_id = None
    
    db.commit()
    return {"status": "ok"}

@router.get("/sin-seccion/{anio_escolar_id}")
def get_estudiantes_sin_seccion(
    anio_escolar_id: int,
    db: Session = Depends(deps.get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user: Usuario = Depends(get_current_user)
):
    """Estudiantes del centro que aún no tienen sección asignada en el año escolar dado."""
    # IDs de estudiantes que YA tienen sección en este año
    con_seccion = db.query(EstudianteSeccion.estudiante_id).filter(
        EstudianteSeccion.anio_escolar_id == anio_escolar_id
    ).subquery()

    estudiantes = db.query(Estudiante).filter(
        Estudiante.centro_id == centro_id,
        Estudiante.es_activo == True,
        ~Estudiante.id.in_(con_seccion)
    ).all()
    return [{
        "id": e.id,
        "nombre_completo": f"{e.primer_nombre} {e.primer_apellido}",
        "rne": e.rne,
        "cedula": e.cedula or ""
    } for e in estudiantes]

@router.get("/por-seccion/{seccion_id}")
def get_estudiantes_por_seccion(
    seccion_id: int,
    anio_escolar_id: int,
    db: Session = Depends(deps.get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user: Usuario = Depends(get_current_user)
):
    """Estudiantes matriculados en una sección específica."""
    registros = db.query(EstudianteSeccion).filter(
        EstudianteSeccion.seccion_id == seccion_id,
        EstudianteSeccion.anio_escolar_id == anio_escolar_id
    ).all()

    result = []
    for r in registros:
        est = db.query(Estudiante).filter(Estudiante.id == r.estudiante_id).first()
        if est:
            result.append({
                "id": est.id,
                "nombre_completo": f"{est.primer_nombre} {est.primer_apellido}",
                "rne": est.rne,
                "numero_orden": r.numero_orden,
                "estado": r.estado.value,
                "inscripcion_id": r.id
            })
    return result

class AsignarEstudiantePayload(BaseModel):
    estudiante_id: int
    seccion_id: int
    anio_escolar_id: int

@router.post("/asignar-seccion")
def asignar_estudiante_a_seccion(
    payload: AsignarEstudiantePayload,
    db: Session = Depends(deps.get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user: Usuario = Depends(get_current_user)
):
    """Asigna un estudiante a una sección. Si ya tiene sección en ese año, la actualiza."""
    from app.models.enums import EstadoEstudianteTipo, CondicionInicialTipo
    from datetime import date

    # Verificar que el estudiante existe y pertenece al centro
    est = db.query(Estudiante).filter(
        Estudiante.id == payload.estudiante_id,
        Estudiante.centro_id == centro_id
    ).first()
    if not est:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    # ¿Ya tiene asignación en este año?
    existente = db.query(EstudianteSeccion).filter(
        EstudianteSeccion.estudiante_id == payload.estudiante_id,
        EstudianteSeccion.anio_escolar_id == payload.anio_escolar_id
    ).first()

    if existente:
        existente.seccion_id = payload.seccion_id
        existente.estado = EstadoEstudianteTipo.ACTIVO
        db.commit()
        return {"ok": True, "accion": "actualizado"}

    # Calcular número de orden
    ultimo = db.query(EstudianteSeccion).filter(
        EstudianteSeccion.seccion_id == payload.seccion_id,
        EstudianteSeccion.anio_escolar_id == payload.anio_escolar_id
    ).order_by(EstudianteSeccion.numero_orden.desc()).first()
    nuevo_orden = (ultimo.numero_orden + 1) if ultimo else 1

    nueva = EstudianteSeccion(
        estudiante_id=payload.estudiante_id,
        seccion_id=payload.seccion_id,
        anio_escolar_id=payload.anio_escolar_id,
        numero_orden=nuevo_orden,
        condicion_inicial=CondicionInicialTipo.NUEVO_INGRESO,
        estado=EstadoEstudianteTipo.ACTIVO,
        fecha_ingreso=date.today()
    )
    db.add(nueva)
    db.commit()
    return {"ok": True, "accion": "creado"}

@router.delete("/retirar-seccion/{inscripcion_id}")
def retirar_estudiante_de_seccion(
    inscripcion_id: int,
    db: Session = Depends(deps.get_db),
    centro_id: int = Depends(get_current_active_centro),
    current_user: Usuario = Depends(get_current_user)
):
    """Retira un estudiante de su sección actual (borra la inscripción)."""
    inscripcion = db.query(EstudianteSeccion).filter(EstudianteSeccion.id == inscripcion_id).first()
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    db.delete(inscripcion)
    db.commit()
    return {"ok": True}
