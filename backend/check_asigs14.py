import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.api.endpoints.usuarios import read_usuarios, read_usuarios_by_centro

db = SessionLocal()
print("Verificando endpoints de usuarios...")
# We don't have current_user, so we'll just check the code in users.py directly
