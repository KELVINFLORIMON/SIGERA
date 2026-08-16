from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
import bcrypt
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Toma una contraseña en texto plano (la que el usuario escribe) y 
    la compara con la contraseña encriptada (hasheada) de la base de datos.
    Devuelve True si coinciden, False si no.
    """
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """
    Toma una contraseña en texto plano y la convierte en un 'hash' indescifrable
    antes de guardarla en la base de datos por seguridad.
    """
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_bytes.decode('utf-8')

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    """
    Genera un Token JWT (Pase de entrada) para el usuario una vez que hace login correctamente.
    - subject: Generalmente es el ID del usuario.
    - expires_delta: Cuánto tiempo durará el token antes de vencer.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Si no se pasa un tiempo, toma el tiempo por defecto configurado en settings
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    # to_encode es el contenido del Token: fecha de expiración (exp) y el sujeto/ID (sub)
    to_encode = {"exp": expire, "sub": str(subject)}
    # Se encripta el token con la LLAVE MAESTRA (SECRET_KEY) para que nadie pueda alterarlo
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
