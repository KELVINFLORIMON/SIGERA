from typing import Optional, List
from pydantic import BaseModel, Field, model_validator
from app.models.enums import SituacionFinalTipo, NivelDesempenoTipo

class CalificacionGrupoBase(BaseModel):
    grupo_competencia_id: int = Field(..., description="ID del Grupo de Competencia (GC1, GC2, GC3, GC4)")
    nota_p1: Optional[int] = Field(None, ge=0, le=100)
    nota_rp1: Optional[int] = Field(None, ge=0, le=100)
    nota_p2: Optional[int] = Field(None, ge=0, le=100)
    nota_rp2: Optional[int] = Field(None, ge=0, le=100)
    nota_p3: Optional[int] = Field(None, ge=0, le=100)
    nota_rp3: Optional[int] = Field(None, ge=0, le=100)
    nota_p4: Optional[int] = Field(None, ge=0, le=100)
    nota_rp4: Optional[int] = Field(None, ge=0, le=100)
    
    @model_validator(mode='after')
    def validar_reglas(self) -> 'CalificacionGrupoBase':
        # Validar recuperación vs normal
        if self.nota_p1 is not None and self.nota_rp1 is not None:
            if self.nota_rp1 < self.nota_p1:
                raise ValueError('La nota RP1 no puede ser menor a P1')
        if self.nota_p2 is not None and self.nota_rp2 is not None:
            if self.nota_rp2 < self.nota_p2:
                raise ValueError('La nota RP2 no puede ser menor a P2')
        if self.nota_p3 is not None and self.nota_rp3 is not None:
            if self.nota_rp3 < self.nota_p3:
                raise ValueError('La nota RP3 no puede ser menor a P3')
        if self.nota_p4 is not None and self.nota_rp4 is not None:
            if self.nota_rp4 < self.nota_p4:
                raise ValueError('La nota RP4 no puede ser menor a P4')

        return self

class CalificacionEstudianteUpdate(BaseModel):
    grupos: List[CalificacionGrupoBase]
    
    nota_completiva: Optional[int] = Field(None, ge=0, le=100)
    nota_extraordinaria: Optional[int] = Field(None, ge=0, le=100)
    nota_especial: Optional[int] = Field(None, ge=0, le=100)
    
    @model_validator(mode='after')
    def validar_cuatro_grupos(self) -> 'CalificacionEstudianteUpdate':
        if len(self.grupos) != 4:
            raise ValueError('Debe enviar exactamente las calificaciones de los 4 Grupos de Competencias')
            
        def es_completo(p: Optional[int], rp: Optional[int]) -> bool:
            if p is None: return False
            if p < 70 and rp is None: return False
            return True
            
        # Nota: Se han flexibilizado las reglas de secuencia global. 
        # Antes se exigía que P1 estuviese completo en los 4 GC para permitir P2, 
        # pero esto bloqueaba el guardado si el docente ingresaba notas por columna o había datos legacy.
        
        return self

class GrupoResponse(CalificacionGrupoBase):
    promedio_competencia: Optional[float] = None

class CalificacionResponse(BaseModel):
    id: int
    estudiante_seccion_id: int
    asignatura_id: int
    grupos: List[GrupoResponse]
    calificacion_final: Optional[int] = None
    nota_completiva: Optional[int] = None
    nota_extraordinaria: Optional[int] = None
    nota_especial: Optional[int] = None
    
    situacion_final: SituacionFinalTipo
    nivel_desempeno: NivelDesempenoTipo

    class Config:
        from_attributes = True
