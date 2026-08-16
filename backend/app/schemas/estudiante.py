from pydantic import BaseModel, constr, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List
from app.models.enums import SexoTipo, CondicionInicialTipo, EstadoEstudianteTipo, SituacionFinalTipo, TipoRepresentanteTipo

class EstudianteBase(BaseModel):
    rne: str = Field(..., max_length=20)
    cedula: Optional[str] = Field(None, max_length=20)
    primer_nombre: str = Field(..., max_length=80)
    segundo_nombre: Optional[str] = Field(None, max_length=80)
    primer_apellido: str = Field(..., max_length=80)
    segundo_apellido: Optional[str] = Field(None, max_length=80)
    sexo: SexoTipo
    fecha_nacimiento: date
    correo: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=20)

class EstudianteCreate(EstudianteBase):
    centro_id: int
    seccion_id: Optional[int] = None
    anio_escolar_id: Optional[int] = None

class EstudianteUpdate(EstudianteBase):
    centro_id: Optional[int] = None

class EstudianteSeccionResponse(BaseModel):
    id: int
    estudiante_id: int
    seccion_id: int
    anio_escolar_id: int
    numero_orden: int
    estado: EstadoEstudianteTipo
    situacion_final: Optional[SituacionFinalTipo] = None
    asignaturas_en_recuperacion: List[str] = []
    situaciones_asignaturas: dict = {}
    
    class Config:
        from_attributes = True

class RepresentanteResponse(BaseModel):
    id: int
    tipo: TipoRepresentanteTipo
    nombre_completo: str
    telefono_1: Optional[str]
    telefono_2: Optional[str]
    correo: Optional[str]
    
    class Config:
        from_attributes = True

class EstudianteResponse(EstudianteBase):
    id: int
    centro_id: Optional[int] = None
    es_activo: bool
    creado_en: datetime
    secciones: List[EstudianteSeccionResponse] = []
    representantes: List[RepresentanteResponse] = []
    
    class Config:
        from_attributes = True
