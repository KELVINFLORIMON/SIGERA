import requests
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env')

API_URL = 'http://localhost:8000/api/v1'

# 1. First get a valid token (superuser login)
try:
    print("Iniciando sesión...")
    res = requests.post(f"{API_URL}/auth/login", data={"username": "kflorimon@gmail.com", "password": "123"})
    res.raise_for_status()
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "X-Centro-Id": "1"}
    
    # 2. Let's find the Docente ID for Kelvin Florimon
    print("\n--- Usuarios y Docentes ---")
    res = requests.get(f"{API_URL}/usuarios/", headers=headers)
    usuarios = res.json()
    docente_user = next((u for u in usuarios if "Kelvin Florimon" in u.get("nombre_completo", "") and "DOCENTE" in u.get("roles", [])), None)
    
    if not docente_user:
        print("No se encontró al docente.")
    else:
        print(f"Docente encontrado: {docente_user}")
        docente_id = docente_user["docente_id"]
        
        # 3. Check assignments for this docente
        print(f"\n--- Asignaciones del Docente (ID: {docente_id}) ---")
        res = requests.get(f"{API_URL}/asignaciones/docente/{docente_id}", headers=headers)
        if res.status_code == 200:
            print("Status 200")
            print(res.json())
        else:
            print(f"Error: {res.status_code} - {res.text}")
            
    # 4. Check assignments by section
    print("\n--- Secciones y Asignaciones ---")
    res = requests.get(f"{API_URL}/secciones/", headers=headers)
    secciones = res.json()
    for s in secciones:
        print(f"Sección {s['nombre']} (ID: {s['id']}, Grado ID: {s['grado_id']})")
        res_asig = requests.get(f"{API_URL}/asignaciones/seccion/{s['id']}", headers=headers)
        if res_asig.status_code == 200:
            asigs = res_asig.json()
            if asigs:
                for a in asigs:
                    print(f"  - Asignatura {a['asignatura_nombre']} (ID: {a.get('asignatura_id')}) -> Docente: {a['docente_nombre']} (ID: {a.get('docente_id')})")
            else:
                print("  - Sin asignaciones")
                
except Exception as e:
    print(f"Error: {e}")
