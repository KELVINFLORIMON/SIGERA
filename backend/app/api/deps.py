from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.db.session import SessionLocal
from app.core.config import settings
from app.core import security
from app.models.seguridad import Usuario, UsuarioRol
from app.schemas.token import TokenPayload

# Configuración para que FastAPI sepa de dónde leer el token (estándar OAuth2)
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)

def get_db() -> Generator:
    """
    Función que provee una conexión a la base de datos para cada petición.
    Una vez que la petición termina, cierra la conexión automáticamente.
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> Usuario:
    """
    Dependencia clave de seguridad. Se ejecuta en cada endpoint protegido.
    1. Toma el Token JWT de la cabecera de la petición.
    2. Lo decodifica usando la SECRET_KEY.
    3. Extrae el ID del usuario.
    4. Busca el usuario en la Base de Datos.
    5. Si el token es inválido o el usuario no existe, lanza un error 401/403.
    """
    try:
        # Decodificamos el token para ver qué hay dentro
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    try:
        # Convertimos el subject (sub) a entero, que es nuestro ID de usuario
        user_id = int(token_data.sub)
    except (ValueError, TypeError):
        raise HTTPException(status_code=404, detail="User not found")
        
    # Buscamos el usuario en la BD
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.es_activo:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return user

def get_current_active_superuser(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """
    Dependencia extra para rutas que solo deben ser accesibles por administradores.
    Primero valida que el usuario esté logueado, y luego revisa si tiene el rol superusuario.
    """
    if not current_user.es_superusuario:
        raise HTTPException(
            status_code=403, detail="El usuario no tiene suficientes privilegios"
        )
    return current_user

def get_current_active_centro(
    x_centro_id: Optional[int] = Header(None, alias="X-Centro-Id"),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> int:
    """
    Dependencia que verifica a cuál Centro Educativo intenta acceder el usuario.
    Si es superusuario, debe enviar el header obligatoriamente.
    Si es usuario regular y no envía el header, se auto-resuelve con el centro de su rol.
    """
    if current_user.es_superusuario:
        if not x_centro_id:
            raise HTTPException(status_code=400, detail="El superusuario debe especificar el centro (X-Centro-Id).")
        return x_centro_id

    # Auto-resolución para usuarios regulares
    if not x_centro_id:
        from app.models.seguridad import UsuarioRol
        ur = db.query(UsuarioRol).filter(UsuarioRol.usuario_id == current_user.id).first()
        if ur and ur.centro_id:
            return ur.centro_id
        raise HTTPException(status_code=400, detail="X-Centro-Id header is missing y el usuario no tiene un centro asignado.")

    # Si no es superusuario y envió un centro específico, verificamos que tenga permisos
    from app.models.seguridad import UsuarioRol
    rol_centro = db.query(UsuarioRol).filter(
        UsuarioRol.usuario_id == current_user.id,
        (UsuarioRol.centro_id == x_centro_id) | (UsuarioRol.centro_id.is_(None))
    ).first()

    if not rol_centro:
        raise HTTPException(
            status_code=403, 
            detail="No tienes permisos para acceder a este centro educativo."
        )

    return x_centro_id

