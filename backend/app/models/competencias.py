from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey, SmallInteger, Text, Numeric, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base_class import Base

class CompetenciaEspecifica(Base):
    __tablename__ = "competencia_especifica"
    
    id = Column(BigInteger, primary_key=True, index=True)
    asignatura_id = Column(BigInteger, ForeignKey("asignatura.id", ondelete="RESTRICT"), nullable=False)
    codigo = Column(String(20), nullable=False) # ej: "PC1"
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)
    orden = Column(SmallInteger, default=1, nullable=False)
    es_activa = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('asignatura_id', 'codigo', name='uq_competencia_codigo'),
    )

class GrupoCompetencia(Base):
    __tablename__ = "grupo_competencia"
    
    id = Column(BigInteger, primary_key=True, index=True)
    asignatura_id = Column(BigInteger, ForeignKey("asignatura.id", ondelete="RESTRICT"), nullable=False)
    grado_id = Column(BigInteger, ForeignKey("grado.id", ondelete="RESTRICT"), nullable=True)
    nombre_grupo = Column(String(100), nullable=False)
    descripcion = Column(String(200))
    peso_porcentaje = Column(Numeric(5, 2), default=0.00, nullable=False)
    orden = Column(SmallInteger, default=1, nullable=False)
    es_activo = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class GrupoCompetenciaDetalle(Base):
    __tablename__ = "grupo_competencia_detalle"
    
    id = Column(BigInteger, primary_key=True, index=True)
    grupo_competencia_id = Column(BigInteger, ForeignKey("grupo_competencia.id", ondelete="CASCADE"), nullable=False)
    competencia_id = Column(BigInteger, ForeignKey("competencia_especifica.id", ondelete="RESTRICT"), nullable=False)
    peso = Column(Numeric(5, 2), default=1.00, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('grupo_competencia_id', 'competencia_id', name='uq_grupo_competencia'),
    )
