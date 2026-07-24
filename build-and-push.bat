@echo off
REM Script para Build e Push das imagens para o Docker Hub (Windows)

set /p DOCKER_USER="Digite seu usuario do Docker Hub: "

echo.
echo ========================================================
echo Compilando imagem do Backend...
echo ========================================================
docker build -t %DOCKER_USER%/ingles-proposito-backend:latest ./backend

echo.
echo ========================================================
echo Compilando imagem do Frontend...
echo ========================================================
docker build -t %DOCKER_USER%/ingles-proposito-frontend:latest ./frontend

echo.
echo ========================================================
echo Enviando imagens para o Docker Hub...
echo ========================================================
docker push %DOCKER_USER%/ingles-proposito-backend:latest
docker push %DOCKER_USER%/ingles-proposito-frontend:latest

echo.
echo ========================================================
echo Sucesso! As imagens foram enviadas para o Docker Hub.
echo Agora na sua VPS basta executar:
echo docker compose -f compose.prod.yaml pull
echo docker compose -f compose.prod.yaml up -d
echo ========================================================
