from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from decimal import Decimal

# Competencia Especifica
class CompetenciaEspecificaBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    orden: int = 1
    es_activa: bool = True

class CompetenciaEspecificaCreate(CompetenciaEspecificaBase):
    asignatura_id: int

class CompetenciaEspecificaResponse(CompetenciaEspecificaBase):
    id: int
    asignatura_id: int
    model_config = ConfigDict(from_attributes=True)

# Grupo Competencia
class GrupoCompetenciaBase(BaseModel):
    nombre_grupo: str
    descripcion: Optional[str] = None
    orden: int = 1
    peso_porcentaje: Decimal = Decimal('0.00')

class GrupoCompetenciaCreate(GrupoCompetenciaBase):
    asignatura_id: int
    grado_id: Optional[int] = None
    competencias_ids: List[int] = [] # IDs of specific competencies in this group

class GrupoCompetenciaResponse(GrupoCompetenciaBase):
    id: int
    asignatura_id: int
    grado_id: Optional[int] = None
    es_activo: bool
    competencias_especificas: List[CompetenciaEspecificaResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

# Grado Asignatura
class GradoAsignaturaBase(BaseModel):
    grado_id: int
    asignatura_id: int
    creditos: Optional[int] = None
    horas_semana: Optional[int] = None
    es_activa: bool = True

class GradoAsignaturaCreate(GradoAsignaturaBase):
    pass

class GradoAsignaturaResponse(GradoAsignaturaBase):
    id: int
    
    # We can include standard details to display nicely
    asignatura_codigo: Optional[str] = None
    asignatura_nombre: Optional[str] = None
    grupos_competencia: List[GrupoCompetenciaResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
