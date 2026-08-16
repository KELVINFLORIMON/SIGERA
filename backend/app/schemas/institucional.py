from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from app.models.enums import TandaTipo, ModalidadTipo, EstadoAnioTipo, EstadoPeriodoTipo

# ----------------------------------------
# Regional
# ----------------------------------------
class RegionalBase(BaseModel):
    codigo: str = Field(..., max_length=10)
    nombre: str = Field(..., max_length=150)
    es_activa: Optional[bool] = True

class RegionalCreate(RegionalBase):
    pass

class RegionalSchema(RegionalBase):
    id: int
    creado_en: datetime
    actualizado_en: datetime

    class Config:
        from_attributes = True

# ----------------------------------------
# Distrito
# ----------------------------------------
class DistritoBase(BaseModel):
    codigo: str = Field(..., max_length=10)
    nombre: str = Field(..., max_length=150)
    es_activo: Optional[bool] = True

class DistritoCreate(DistritoBase):
    regional_id: int

class DistritoSchema(DistritoBase):
    id: int
    regional_id: int
    creado_en: datetime
    actualizado_en: datetime

    class Config:
        from_attributes = True

# ----------------------------------------
# Periodo Academico
# ----------------------------------------
class PeriodoAcademicoBase(BaseModel):
    numero: int = Field(..., ge=1, le=4)
    nombre: str
    fecha_inicio: date
    fecha_fin: date
    estado: Optional[EstadoPeriodoTipo] = EstadoPeriodoTipo.PENDIENTE

class PeriodoAcademicoUpdate(BaseModel):
    """
    Se permite actualizar las fechas de los periodos o su nombre.
    """
    nombre: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None

class PeriodoAcademico(PeriodoAcademicoBase):
    id: int
    anio_escolar_id: int
    cerrado_en: Optional[datetime] = None
    cerrado_por: Optional[int] = None
    creado_en: datetime
    actualizado_en: datetime

    class Config:
        orm_mode = True


# ----------------------------------------
# Año Escolar
# ----------------------------------------
class AnioEscolarBase(BaseModel):
    descripcion: str = Field(..., description="Ej. 2026-2027")
    fecha_inicio: date
    fecha_fin: date
    estado: Optional[EstadoAnioTipo] = EstadoAnioTipo.CONFIGURACION
    es_activo: Optional[bool] = True

class AnioEscolarCreate(AnioEscolarBase):
    centro_id: int

class AnioEscolarUpdate(BaseModel):
    descripcion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    estado: Optional[EstadoAnioTipo] = None
    es_activo: Optional[bool] = None

class AnioEscolar(AnioEscolarBase):
    id: int
    centro_id: int
    creado_en: datetime
    actualizado_en: datetime
    creado_por: Optional[int] = None
    periodos: List[PeriodoAcademico] = []

    class Config:
        orm_mode = True


# ----------------------------------------
# Centro Educativo
# ----------------------------------------
class CentroEducativoBase(BaseModel):
    codigo_minerd: str
    nombre: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    tanda_principal: Optional[TandaTipo] = None
    modalidad: Optional[ModalidadTipo] = None
    es_activo: Optional[bool] = True

class CentroEducativoCreate(CentroEducativoBase):
    distrito_id: int

class CentroEducativoUpdate(BaseModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    tanda_principal: Optional[TandaTipo] = None
    modalidad: Optional[ModalidadTipo] = None
    es_activo: Optional[bool] = None
    distrito_id: Optional[int] = None

class CentroEducativo(CentroEducativoBase):
    id: int
    distrito_id: int
    creado_en: datetime
    actualizado_en: datetime

    class Config:
        orm_mode = True
