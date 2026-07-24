#!/bin/bash
# Script para Build e Push das imagens para o Docker Hub (Linux/Mac)

read -p "Digite seu usuario do Docker Hub: " DOCKER_USER

echo "========================================================"
echo "Compilando imagem do Backend..."
echo "========================================================"
docker build -t ${DOCKER_USER}/ingles-proposito-backend:latest ./backend

echo "========================================================"
echo "Compilando imagem do Frontend..."
echo "========================================================"
docker build -t ${DOCKER_USER}/ingles-proposito-frontend:latest ./frontend

echo "========================================================"
echo "Enviando imagens para o Docker Hub..."
echo "========================================================"
docker push ${DOCKER_USER}/ingles-proposito-backend:latest
docker push ${DOCKER_USER}/ingles-proposito-frontend:latest

echo "========================================================"
echo "Sucesso! As imagens foram enviadas para o Docker Hub."
echo "Na sua VPS, execute:"
echo "docker compose -f compose.prod.yaml pull"
echo "docker compose -f compose.prod.yaml up -d"
echo "========================================================"
