# Importar Base aquí para que pueda ser expuesta por el paquete de models
from app.db.base_class import Base

# Importar todos los Enums
from app.models.enums import (
    TandaTipo, ModalidadTipo, CondicionInicialTipo, EstadoEstudianteTipo,
    EstadoPeriodoTipo, EstadoAnioTipo, SituacionFinalTipo, NivelDesempenoTipo,
    SexoTipo, TipoRepresentanteTipo, RolNombreTipo
)

# Importar todos los Modelos para que Base.metadata.create_all() (o Alembic) los detecte
from app.models.institucional import Regional, Distrito, CentroEducativo, AnioEscolar
from app.models.academica import PeriodoAcademico, Grado, Seccion, Asignatura, GradoAsignatura
from app.models.personas import Estudiante, EstudianteSeccion, Representante, Docente, AsignacionDocente
from app.models.competencias import CompetenciaEspecifica, GrupoCompetencia, GrupoCompetenciaDetalle
from app.models.evaluacion import CalificacionAsignatura, CalificacionGrupo, Boletin, ObservacionBoletin
from app.models.seguridad import Usuario, Rol, UsuarioRol, Permiso, RolPermiso, AuditoriaCalificacion
