import json
import urllib.request
import urllib.parse
import sys

# Forzar utf-8
sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://localhost:8002/api/v1"
LOGIN_URL = f"{API_URL}/login/access-token"
ASIGNACIONES_URL = f"{API_URL}/docentes/me/asignaciones"

print("1. Intentando iniciar sesión como docente...")
data = urllib.parse.urlencode({
    "username": "juan.perez@docente.edu.do",
    "password": "docente123"
}).encode('utf-8')

req = urllib.request.Request(LOGIN_URL, data=data, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        if response.status == 200:
            token_data = json.loads(response.read().decode('utf-8'))
            token = token_data.get("access_token")
            print("[EXITO] Login exitoso. Token obtenido.")
            
            print("\n2. Obteniendo asignaciones del docente...")
            req_asig = urllib.request.Request(ASIGNACIONES_URL, headers={"Authorization": f"Bearer {token}"})
            
            with urllib.request.urlopen(req_asig) as asig_response:
                if asig_response.status == 200:
                    asignaciones = json.loads(asig_response.read().decode('utf-8'))
                    print(f"[EXITO] Se encontraron {len(asignaciones)} asignaciones activas.")
                    
                    for idx, asig in enumerate(asignaciones, 1):
                        print(f"\n--- Asignación {idx} ---")
                        print(f"ID Asignación: {asig['id']}")
                        print(f"Materia: {asig['asignatura']['nombre']} ({asig['asignatura']['codigo']})")
                        print(f"Sección: {asig['seccion']['nombre']}")
                        print(f"Grado: {asig['seccion']['grado']['nombre']} (Nivel {asig['seccion']['grado']['numero']})")
                        print(f"Es activa: {asig['es_activa']}")
                        
                    print("\nPrueba de backend completada con éxito.")
except Exception as e:
    print(f"[ERROR] Error durante la prueba: {e}")
