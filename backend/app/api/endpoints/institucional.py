from typing import List, Any
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.institucional import CentroEducativo, AnioEscolar, Regional, Distrito
from app.models.academica import PeriodoAcademico
from app.schemas.institucional import (
    RegionalSchema, RegionalCreate,
    DistritoSchema, DistritoCreate,
    CentroEducativo as CentroEducativoSchema,
    CentroEducativoCreate,
    CentroEducativoUpdate,
    AnioEscolar as AnioEscolarSchema,
    AnioEscolarCreate,
    AnioEscolarUpdate,
    PeriodoAcademico as PeriodoAcademicoSchema,
    PeriodoAcademicoUpdate
)
from app.models.enums import EstadoPeriodoTipo
from app.api.deps import get_current_active_superuser, get_current_active_centro

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------
# Regionales y Distritos
# ---------------------------------------------------------
@router.get("/regionales", response_model=List[RegionalSchema])
def get_regionales(db: Session = Depends(get_db)):
    return db.query(Regional).all()

@router.post("/regionales", response_model=RegionalSchema)
def create_regional(regional_in: RegionalCreate, db: Session = Depends(get_db)):
    regional = Regional(**regional_in.dict())
    db.add(regional)
    db.commit()
    db.refresh(regional)
    return regional

@router.get("/distritos", response_model=List[DistritoSchema])
def get_distritos(db: Session = Depends(get_db)):
    return db.query(Distrito).all()

@router.post("/distritos", response_model=DistritoSchema)
def create_distrito(distrito_in: DistritoCreate, db: Session = Depends(get_db)):
    distrito = Distrito(**distrito_in.dict())
    db.add(distrito)
    db.commit()
    db.refresh(distrito)
    return distrito

# ---------------------------------------------------------
# Centros Educativos
# ---------------------------------------------------------
@router.get("/centros", response_model=List[CentroEducativoSchema])
def get_centros(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_superuser)
):
    """Obtener lista de centros educativos."""
    return db.query(CentroEducativo).all()

@router.post("/centros", response_model=CentroEducativoSchema)
def create_centro(
    centro_in: CentroEducativoCreate, 
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_superuser)
):
    """Crear un nuevo centro educativo."""
    centro = CentroEducativo(**centro_in.dict())
    db.add(centro)
    db.commit()
    db.refresh(centro)
    return centro

@router.put("/centros/{centro_id}", response_model=CentroEducativoSchema)
def update_centro(
    centro_id: int, 
    centro_in: CentroEducativoUpdate, 
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_superuser)
):
    """Actualizar datos del centro educativo."""
    centro = db.query(CentroEducativo).filter(CentroEducativo.id == centro_id).first()
    if not centro:
        raise HTTPException(status_code=404, detail="Centro educativo no encontrado")
        
    update_data = centro_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(centro, key, value)
        
    db.commit()
    db.refresh(centro)
    return centro

@router.delete("/centros/{centro_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_centro(
    centro_id: int, 
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_superuser)
):
    """Eliminar un centro educativo."""
    centro = db.query(CentroEducativo).filter(CentroEducativo.id == centro_id).first()
    if not centro:
        raise HTTPException(status_code=404, detail="Centro educativo no encontrado")
    
    # Check dependencies here if needed (e.g. estudiantes or grados associated with the centro)
    # Since this is a hard delete, we will just try to delete and let DB constraints handle it, 
    # or just delete it.
    
    try:
        db.delete(centro)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se puede eliminar el centro porque tiene registros dependientes.")
    return None

# ---------------------------------------------------------
# Años Escolares
# ---------------------------------------------------------
@router.get("/anios-escolares", response_model=List[AnioEscolarSchema])
def get_anios_escolares(
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro)
):
    """Obtiene todos los años escolares registrados del centro activo."""
    anios = db.query(AnioEscolar).filter(AnioEscolar.centro_id == centro_id).all()
    # Cargar relaciones manualmente si es necesario o configurar join
    # SQLModel/SQLAlchemy lazy loads by default
    return anios

@router.post("/anios-escolares", response_model=AnioEscolarSchema)
def create_anio_escolar(
    anio_in: AnioEscolarCreate, 
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro)
):
    """
    Crea un nuevo Año Escolar.
    Al crearlo, genera automáticamente los 4 periodos académicos estimando las fechas.
    """
    if anio_in.fecha_fin <= anio_in.fecha_inicio:
        raise HTTPException(status_code=400, detail="La fecha de fin debe ser mayor a la fecha de inicio.")

    # Forzar el centro ID
    anio_in.centro_id = centro_id

    # Verificar que el centro existe
    centro = db.query(CentroEducativo).filter(CentroEducativo.id == anio_in.centro_id).first()
    if not centro:
        raise HTTPException(status_code=404, detail="Centro educativo no encontrado. Debe configurar el Centro Educativo primero.")

    # 1. Crear Año Escolar
    nuevo_anio = AnioEscolar(**anio_in.dict())
    db.add(nuevo_anio)
    db.flush() # Para obtener el ID

    # 2. Generar 4 periodos automáticamente (estimación)
    duracion_total = (nuevo_anio.fecha_fin - nuevo_anio.fecha_inicio).days
    duracion_periodo = duracion_total // 4

    for i in range(1, 5):
        p_inicio = nuevo_anio.fecha_inicio + timedelta(days=duracion_periodo * (i - 1))
        # El ultimo periodo termina exactamente en la fecha de fin del año
        p_fin = nuevo_anio.fecha_inicio + timedelta(days=duracion_periodo * i - 1) if i < 4 else nuevo_anio.fecha_fin
        
        periodo = PeriodoAcademico(
            anio_escolar_id=nuevo_anio.id,
            numero=i,
            nombre=f"Período {i}",
            fecha_inicio=p_inicio,
            fecha_fin=p_fin,
            estado=EstadoPeriodoTipo.PENDIENTE
        )
        db.add(periodo)

    db.commit()
    db.refresh(nuevo_anio)
    return nuevo_anio

@router.put("/anios-escolares/{anio_id}", response_model=AnioEscolarSchema)
def update_anio_escolar(
    anio_id: int, 
    anio_in: AnioEscolarUpdate, 
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro)
):
    """Actualiza los datos del año escolar (ej. para activarlo)."""
    anio = db.query(AnioEscolar).filter(AnioEscolar.id == anio_id, AnioEscolar.centro_id == centro_id).first()
    if not anio:
        raise HTTPException(status_code=404, detail="Año escolar no encontrado")
        
    update_data = anio_in.dict(exclude_unset=True)
    if 'fecha_fin' in update_data and 'fecha_inicio' in update_data:
        if update_data['fecha_fin'] <= update_data['fecha_inicio']:
            raise HTTPException(status_code=400, detail="La fecha de fin debe ser mayor a la fecha de inicio.")

    # Validación: Si se intenta activar, verificar que existan grados y secciones (Proceso 1 final)
    if 'estado' in update_data and update_data['estado'] == 'ACTIVO':
        from app.models.academica import Grado, Seccion
        grados = db.query(Grado).filter(Grado.anio_escolar_id == anio_id).all()
        if not grados:
            raise HTTPException(status_code=400, detail="No se puede activar el año escolar porque no tiene grados configurados.")
        secciones = db.query(Seccion).join(Grado).filter(Grado.anio_escolar_id == anio_id).first()
        if not secciones:
            raise HTTPException(status_code=400, detail="No se puede activar el año escolar porque no hay secciones configuradas.")

    for key, value in update_data.items():
        setattr(anio, key, value)
        
    db.commit()
    db.refresh(anio)
    return anio

@router.delete("/anios-escolares/{anio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_anio_escolar(
    anio_id: int, 
    db: Session = Depends(get_db),
    centro_id: int = Depends(get_current_active_centro)
):
    """Elimina un año escolar. Se bloquea si tiene grados asociados."""
    anio = db.query(AnioEscolar).filter(AnioEscolar.id == anio_id, AnioEscolar.centro_id == centro_id).first()
    if not anio:
        raise HTTPException(status_code=404, detail="Año escolar no encontrado")
        
    try:
        from app.models.academica import Grado
        
        # Comprobar si hay grados asociados
        grados = db.query(Grado).filter(Grado.anio_escolar_id == anio_id).all()
        if grados:
            raise HTTPException(
                status_code=400, 
                detail="No se puede eliminar el año escolar porque ya tiene grados configurados. Por favor, elimine los grados primero."
            )

        # Borrar Periodos Académicos (generados automáticamente)
        db.query(PeriodoAcademico).filter(PeriodoAcademico.anio_escolar_id == anio_id).delete(synchronize_session=False)
        
        # Finalmente, borrar el Año Escolar
        db.delete(anio)
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"No se pudo eliminar el año escolar: {str(e)}")

# ---------------------------------------------------------
# Periodos Académicos
# ---------------------------------------------------------
@router.get("/periodos/anio/{anio_id}", response_model=List[PeriodoAcademicoSchema])
def get_periodos_by_anio(anio_id: int, db: Session = Depends(get_db)):
    """Obtiene los 4 periodos académicos de un año escolar específico."""
    periodos = db.query(PeriodoAcademico).filter(PeriodoAcademico.anio_escolar_id == anio_id).order_by(PeriodoAcademico.numero).all()
    return periodos

@router.put("/periodos/{periodo_id}", response_model=PeriodoAcademicoSchema)
def update_periodo(periodo_id: int, periodo_in: PeriodoAcademicoUpdate, db: Session = Depends(get_db)):
    """Permite ajustar las fechas o el nombre de un periodo específico."""
    periodo = db.query(PeriodoAcademico).filter(PeriodoAcademico.id == periodo_id).first()
    if not periodo:
        raise HTTPException(status_code=404, detail="Período académico no encontrado")

    update_data = periodo_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(periodo, key, value)

    # Validar fechas locales del periodo
    if periodo.fecha_fin <= periodo.fecha_inicio:
        raise HTTPException(status_code=400, detail="La fecha de fin debe ser mayor a la de inicio.")

    db.commit()
    db.refresh(periodo)
    return periodo
