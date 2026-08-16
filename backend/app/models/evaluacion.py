from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey, SmallInteger, Text, Enum, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
from app.models.enums import SituacionFinalTipo, NivelDesempenoTipo

class CalificacionAsignatura(Base):
    __tablename__ = "calificacion_asignatura"
    
    id = Column(BigInteger, primary_key=True, index=True)
    estudiante_seccion_id = Column(BigInteger, ForeignKey("estudiante_seccion.id", ondelete="RESTRICT"), nullable=False)
    asignatura_id = Column(BigInteger, ForeignKey("asignatura.id", ondelete="RESTRICT"), nullable=False)
    anio_escolar_id = Column(BigInteger, ForeignKey("anio_escolar.id", ondelete="RESTRICT"), nullable=False)
    asignacion_docente_id = Column(BigInteger, ForeignKey("asignacion_docente.id", ondelete="RESTRICT"))
    
    # Calificación final y desempeño (calculado en base a los promedios de los 4 grupos)
    calificacion_final = Column(SmallInteger)
    
    # Calificaciones de recuperación (Completiva, Extraordinaria, Especial)
    nota_completiva = Column(SmallInteger) # C.E.C
    nota_extraordinaria = Column(SmallInteger) # C.E.EX
    nota_especial = Column(SmallInteger) # C.E
    
    situacion_final = Column(Enum(SituacionFinalTipo), default=SituacionFinalTipo.PENDIENTE, nullable=False)
    nivel_desempeno = Column(Enum(NivelDesempenoTipo), default=NivelDesempenoTipo.SIN_EVALUAR, nullable=False)
    porcentaje_asistencia = Column(SmallInteger)
    
    # Control de estado del registro
    es_borrador = Column(Boolean, default=True, nullable=False)
    
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    actualizado_por = Column(BigInteger)
    
    __table_args__ = (
        UniqueConstraint('estudiante_seccion_id', 'asignatura_id', 'anio_escolar_id', name='uq_calificacion_asignatura'),
        CheckConstraint('calificacion_final BETWEEN 0 AND 100', name='chk_cf'),
        CheckConstraint('nota_completiva BETWEEN 0 AND 100', name='chk_nota_completiva'),
        CheckConstraint('nota_extraordinaria BETWEEN 0 AND 100', name='chk_nota_extraordinaria'),
        CheckConstraint('nota_especial BETWEEN 0 AND 100', name='chk_nota_especial'),
        CheckConstraint('porcentaje_asistencia BETWEEN 0 AND 100', name='chk_porcentaje_asistencia'),
    )

class CalificacionGrupo(Base):
    __tablename__ = "calificacion_grupo"
    
    id = Column(BigInteger, primary_key=True, index=True)
    calificacion_asignatura_id = Column(BigInteger, ForeignKey("calificacion_asignatura.id", ondelete="CASCADE"), nullable=False)
    grupo_competencia_id = Column(BigInteger, ForeignKey("grupo_competencia.id", ondelete="RESTRICT"), nullable=False)
    
    # Notas por periodo
    nota_p1 = Column(SmallInteger)
    nota_rp1 = Column(SmallInteger)
    nota_p2 = Column(SmallInteger)
    nota_rp2 = Column(SmallInteger)
    nota_p3 = Column(SmallInteger)
    nota_rp3 = Column(SmallInteger)
    nota_p4 = Column(SmallInteger)
    nota_rp4 = Column(SmallInteger)
    
    # Promedio del grupo de competencia (PC)
    from sqlalchemy import Numeric
    promedio_competencia = Column(Numeric(5,1))
    
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    actualizado_por = Column(BigInteger)
    
    __table_args__ = (
        UniqueConstraint('calificacion_asignatura_id', 'grupo_competencia_id', name='uq_calificacion_grupo'),
        CheckConstraint('nota_p1 BETWEEN 0 AND 100', name='chk_nota_p1'),
        CheckConstraint('nota_p2 BETWEEN 0 AND 100', name='chk_nota_p2'),
        CheckConstraint('nota_p3 BETWEEN 0 AND 100', name='chk_nota_p3'),
        CheckConstraint('nota_p4 BETWEEN 0 AND 100', name='chk_nota_p4'),
        CheckConstraint('nota_rp1 BETWEEN 0 AND 100 AND (nota_rp1 >= nota_p1)', name='chk_nota_rp1'),
        CheckConstraint('nota_rp2 BETWEEN 0 AND 100 AND (nota_rp2 >= nota_p2)', name='chk_nota_rp2'),
        CheckConstraint('nota_rp3 BETWEEN 0 AND 100 AND (nota_rp3 >= nota_p3)', name='chk_nota_rp3'),
        CheckConstraint('nota_rp4 BETWEEN 0 AND 100 AND (nota_rp4 >= nota_p4)', name='chk_nota_rp4'),
    )

class Boletin(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    estudiante_seccion_id = Column(BigInteger, ForeignKey("estudiante_seccion.id", ondelete="RESTRICT"), nullable=False)
    anio_escolar_id = Column(BigInteger, ForeignKey("anio_escolar.id", ondelete="RESTRICT"), nullable=False)
    periodo_numero = Column(SmallInteger) # NULL = boletín final del año
    tipo = Column(String(20), default='PERIODO', nullable=False) # 'PERIODO' | 'FINAL' | 'PARCIAL'
    archivo_url = Column(Text) # URL/ruta del PDF generado
    generado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    generado_por = Column(BigInteger)

class ObservacionBoletin(Base):
    __tablename__ = "observacion_boletin"
    
    id = Column(BigInteger, primary_key=True, index=True)
    calificacion_asignatura_id = Column(BigInteger, ForeignKey("calificacion_asignatura.id", ondelete="CASCADE"), nullable=False)
    periodo_numero = Column(SmallInteger, nullable=False)
    observacion = Column(Text)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('calificacion_asignatura_id', 'periodo_numero', name='uq_observacion'),
    )
