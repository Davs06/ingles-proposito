#!/bin/bash
# Script para Build, Push e Deploy automático no Portainer (Linux/Mac)

# Arquivo para guardar o histórico da versão
ARQUIVO_VERSAO=".versao_atual"

# Verifica se o arquivo existe e mostra a última versão
if [ -f "$ARQUIVO_VERSAO" ]; then
    ULTIMA_VERSAO=$(cat "$ARQUIVO_VERSAO")
    echo "Última versão enviada: $ULTIMA_VERSAO"
else
    echo "Nenhuma versão anterior registrada."
fi

echo "--------------------------------------------------------"
read -p "Digite seu usuario do Docker Hub: " DOCKER_USER
read -p "Digite a NOVA versão da imagem (ex: v1.1): " VERSION

# Cole aqui a URL gerada pelo seu Portainer
WEBHOOK_URL="https://portainer.techrocket.site/api/stacks/webhooks/408f0016-b38b-456b-84fc-d745a8b59638"

echo ""
echo "========================================================"
echo "Compilando imagem do Backend (Tags: ${VERSION} e latest)..."
echo "========================================================"
docker build -t ${DOCKER_USER}/ingles-proposito-backend:${VERSION} -t ${DOCKER_USER}/ingles-proposito-backend:latest ./backend

echo ""
echo "========================================================"
echo "Compilando imagem do Frontend (Tags: ${VERSION} e latest)..."
echo "========================================================"
docker build -t ${DOCKER_USER}/ingles-proposito-frontend:${VERSION} -t ${DOCKER_USER}/ingles-proposito-frontend:latest ./frontend

echo ""
echo "========================================================"
echo "Enviando imagens para o Docker Hub..."
echo "========================================================"
docker push ${DOCKER_USER}/ingles-proposito-backend:${VERSION}
docker push ${DOCKER_USER}/ingles-proposito-backend:latest
docker push ${DOCKER_USER}/ingles-proposito-frontend:${VERSION}
docker push ${DOCKER_USER}/ingles-proposito-frontend:latest

echo ""
echo "========================================================"
echo "Avisando o Portainer para atualizar a Stack..."
echo "========================================================"
curl -X POST "${WEBHOOK_URL}"

# Salva a nova versão no arquivo para a próxima vez
echo "${VERSION}" > "$ARQUIVO_VERSAO"

echo ""
echo "========================================================"
echo "Sucesso! Tudo atualizado no Docker Hub e no Portainer."
echo "========================================================"