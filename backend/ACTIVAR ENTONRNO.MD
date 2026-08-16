# Inicializar la DB (usando el Python del entorno backend/env)
Set-Location "C:\Users\kelvi\OneDrive - Transformación Digital Educación\Proyecto_SIGERA\backend"
.\env\python.exe seed.py

# Levantar el servidor (ejecutable uvicorn dentro de backend/env)
.\env\Scripts\uvicorn.exe app.main:app --reload --port 8000

## FRONTEND
Set-Location "C:\Users\kelvi\OneDrive - Transformación Digital Educación\Proyecto_SIGERA\frontend"
npm install
npm run dev