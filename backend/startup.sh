#!/bin/bash
# Script de inicio para Azure App Service (Linux)

echo "Iniciando despliegue de SIGERA API..."

# 1. Aplicar las migraciones de la base de datos automáticamente
echo "Aplicando migraciones de Alembic..."
alembic upgrade head

echo "Ejecutando semillas de datos iniciales..."
python seed.py
python seed_competencias.py
python seed_regionales.py
python update_grupos.py || true

# 2. Iniciar el servidor con Gunicorn y Uvicorn workers
# Usamos 4 workers como estándar para mejor concurrencia
echo "Levantando el servidor..."
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind=0.0.0.0:8000
