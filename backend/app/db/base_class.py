from typing import Any
from sqlalchemy.orm import DeclarativeBase, declared_attr

class Base(DeclarativeBase):
    id: Any
    __name__: str
    
    # Genera el nombre de la tabla automáticamente a partir de la clase (snake_case)
    @declared_attr.directive
    def __tablename__(cls) -> str:
        # Convierte CamelCase a snake_case
        import re
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', cls.__name__)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()
