from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.calificacion import CalificacionEstudianteUpdate, CalificacionResponse
from app.core.calculos import MotorCalculo
from app.models.evaluacion import CalificacionAsignatura, CalificacionGrupo
from app.models.personas import Estudiante, EstudianteSeccion

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _validar_regla_secuencia(db_grupos: list[CalificacionGrupo], nuevo_payload: list[dict]):
    """
    Valida que no se inserten notas en un periodo (P2, P3, P4) si el periodo anterior
    (P1, P2, P3 respectivamente) no está completo en TODOS los 4 Grupos de Competencias.
    """
    # Determinar qué periodo está intentando guardar el payload
    # Por simplicidad, compararemos el estado del DB vs el estado del Payload.
    # Esta regla requiere saber exactamente qué periodo se está insertando o podemos validarlo globalmente.
    
    # Extraer estado actual o propuesto
    pass # To be implemented precisely below if needed, but it's easier to validate right before DB commit.

@router.get("/seccion/{seccion_id}/asignatura/{asignatura_id}/estudiantes")
def obtener_estudiantes_con_calificaciones(seccion_id: int, asignatura_id: int, db: Session = Depends(get_db)):
    """
    Retorna la lista de estudiantes de una secciAn con sus calificaciones actuales en la asignatura dada.
    """
    estudiantes_seccion = db.query(EstudianteSeccion, Estudiante).join(
        Estudiante, Estudiante.id == EstudianteSeccion.estudiante_id
    ).filter(
        EstudianteSeccion.seccion_id == seccion_id
    ).order_by(EstudianteSeccion.numero_orden).all()

    from app.models.competencias import GrupoCompetencia
    gcs = db.query(GrupoCompetencia).filter_by(asignatura_id=asignatura_id).all()
    reverse_map_gc = {gc.id: gc.orden for gc in gcs}

    resultado = []
    for es, est in estudiantes_seccion:
        calif_asig = db.query(CalificacionAsignatura).filter(
            CalificacionAsignatura.estudiante_seccion_id == es.id,
            CalificacionAsignatura.asignatura_id == asignatura_id
        ).first()

        grupos_response = []
        if calif_asig:
            grupos = db.query(CalificacionGrupo).filter(
                CalificacionGrupo.calificacion_asignatura_id == calif_asig.id
            ).all()
            for g in grupos:
                # Retornamos el 'orden' (1,2,3,4) esperado por el frontend
                frontend_id = reverse_map_gc.get(g.grupo_competencia_id, g.grupo_competencia_id)
                grupos_response.append({
                    "grupo_competencia_id": frontend_id,
                    "p1": g.nota_p1, "rp1": g.nota_rp1,
                    "p2": g.nota_p2, "rp2": g.nota_rp2,
                    "p3": g.nota_p3, "rp3": g.nota_rp3,
                    "p4": g.nota_p4, "rp4": g.nota_rp4,
                })

        resultado.append({
            "numeroLista": es.numero_orden,
            "estudianteSeccionId": es.id,
            "nombreCompleto": f"{est.primer_apellido} {est.segundo_apellido or ''}, {est.primer_nombre} {est.segundo_nombre or ''}".strip(),
            "notasIniciales": grupos_response,
            "nota_completiva": calif_asig.nota_completiva if calif_asig else None,
            "nota_extraordinaria": calif_asig.nota_extraordinaria if calif_asig else None,
            "nota_especial": calif_asig.nota_especial if calif_asig else None,
        })
    return resultado

@router.put("/{estudiante_seccion_id}/asignatura/{asignatura_id}", response_model=CalificacionResponse)
def actualizar_calificaciones(
    estudiante_seccion_id: int,
    asignatura_id: int,
    calificacion_in: CalificacionEstudianteUpdate,
    db: Session = Depends(get_db)
):
    """
    Recibe las notas ingresadas por el docente para los 4 Grupos de Competencias (GC1-GC4)
    y las guarda en PostgreSQL.
    """
    from app.models.competencias import GrupoCompetencia
    
    # Obtener los IDs reales de GrupoCompetencia para esta asignatura
    gcs = db.query(GrupoCompetencia).filter_by(asignatura_id=asignatura_id).order_by(GrupoCompetencia.orden).all()
    map_gc = {gc.orden: gc.id for gc in gcs}
    
    # Mapear los IDs enviados por el frontend (1, 2, 3, 4) a los IDs reales
    for g in calificacion_in.grupos:
        if g.grupo_competencia_id in map_gc:
            g.grupo_competencia_id = map_gc[g.grupo_competencia_id]
    
    # 2. Preparamos los datos para el Motor de Cálculo
    grupos_datos = []
    for g in calificacion_in.grupos:
        grupos_datos.append({
            "grupo_competencia_id": g.grupo_competencia_id,
            "p1": g.nota_p1, "rp1": g.nota_rp1,
            "p2": g.nota_p2, "rp2": g.nota_rp2,
            "p3": g.nota_p3, "rp3": g.nota_rp3,
            "p4": g.nota_p4, "rp4": g.nota_rp4,
        })
    
    # 3. Invocamos al Motor de Cálculo pasando todos los grupos y las nuevas notas
    resultados = MotorCalculo.procesar_calificaciones_asignatura(
        grupos_datos, 
        cec=calificacion_in.nota_completiva,
        ceex=calificacion_in.nota_extraordinaria,
        ce=calificacion_in.nota_especial
    )
    
    # 4. Guardar en Base de Datos PostgreSQL
    # Buscar si ya existe el registro de CalificacionAsignatura
    calif_asig = db.query(CalificacionAsignatura).filter(
        CalificacionAsignatura.estudiante_seccion_id == estudiante_seccion_id,
        CalificacionAsignatura.asignatura_id == asignatura_id
        # anio_escolar_id lo omitimos por simplicidad en esta maqueta, o deberíamos usar el año activo.
    ).first()
    
    if not calif_asig:
        # Buscar el anio_escolar_id correcto desde el EstudianteSeccion
        es = db.query(EstudianteSeccion).filter(EstudianteSeccion.id == estudiante_seccion_id).first()
        anio_escolar_id = 1
        if es:
            anio_escolar_id = es.anio_escolar_id
            
        calif_asig = CalificacionAsignatura(
            estudiante_seccion_id=estudiante_seccion_id,
            asignatura_id=asignatura_id,
            anio_escolar_id=anio_escolar_id,
            calificacion_final=resultados["calificacion_final"],
            nota_completiva=calificacion_in.nota_completiva,
            nota_extraordinaria=calificacion_in.nota_extraordinaria,
            nota_especial=calificacion_in.nota_especial,
            situacion_final=resultados["situacion_final"],
            nivel_desempeno=resultados["nivel_desempeno"]
        )
        db.add(calif_asig)
        db.flush() # Para obtener el ID
    else:
        calif_asig.calificacion_final = resultados["calificacion_final"]
        calif_asig.nota_completiva = calificacion_in.nota_completiva
        calif_asig.nota_extraordinaria = calificacion_in.nota_extraordinaria
        calif_asig.nota_especial = calificacion_in.nota_especial
        calif_asig.situacion_final = resultados["situacion_final"]
        calif_asig.nivel_desempeno = resultados["nivel_desempeno"]
        
    # Guardar Grupos
    for res_g in resultados["grupos"]:
        calif_grupo = db.query(CalificacionGrupo).filter(
            CalificacionGrupo.calificacion_asignatura_id == calif_asig.id,
            CalificacionGrupo.grupo_competencia_id == res_g["grupo_competencia_id"]
        ).first()
        
        if not calif_grupo:
            calif_grupo = CalificacionGrupo(
                calificacion_asignatura_id=calif_asig.id,
                grupo_competencia_id=res_g["grupo_competencia_id"]
            )
            db.add(calif_grupo)
            
        calif_grupo.nota_p1 = res_g["nota_p1"]
        calif_grupo.nota_rp1 = res_g["nota_rp1"]
        calif_grupo.nota_p2 = res_g["nota_p2"]
        calif_grupo.nota_rp2 = res_g["nota_rp2"]
        calif_grupo.nota_p3 = res_g["nota_p3"]
        calif_grupo.nota_rp3 = res_g["nota_rp3"]
        calif_grupo.nota_p4 = res_g["nota_p4"]
        calif_grupo.nota_rp4 = res_g["nota_rp4"]
        calif_grupo.promedio_competencia = res_g["promedio_competencia"]
        
    db.commit()
    
    # Preparar la respuesta JSON
    response_data = {
        "id": calif_asig.id,
        "estudiante_seccion_id": estudiante_seccion_id,
        "asignatura_id": asignatura_id,
        "grupos": resultados["grupos"],
        "calificacion_final": resultados["calificacion_final"],
        "nota_completiva": calificacion_in.nota_completiva,
        "nota_extraordinaria": calificacion_in.nota_extraordinaria,
        "nota_especial": calificacion_in.nota_especial,
        "situacion_final": resultados["situacion_final"],
        "nivel_desempeno": resultados["nivel_desempeno"]
    }
    
    return response_data
