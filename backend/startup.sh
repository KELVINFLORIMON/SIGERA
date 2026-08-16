#!/bin/bash
# Script de inicio para Azure App Service (Linux)

echo "Iniciando despliegue de SIGERA API..."

# 1. Aplicar las migraciones de la base de datos automáticamente
echo "Aplicando migraciones de Alembic..."
alembic upgrade head

# 2. Iniciar el servidor con Gunicorn y Uvicorn workers
# Usamos 4 workers como estándar para mejor concurrencia
echo "Levantando el servidor..."
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind=0.0.0.0:8000
