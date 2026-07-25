@echo off
REM Script para Build, Push e Deploy automatico no Portainer (Windows)

set ARQUIVO_VERSAO=.versao_atual

REM Verifica se o arquivo existe e mostra a ultima versao
if exist %ARQUIVO_VERSAO% (
    set /p ULTIMA_VERSAO=<%ARQUIVO_VERSAO%
    echo Ultima versao enviada: %ULTIMA_VERSAO%
) else (
    echo Nenhuma versao anterior registrada.
)

echo --------------------------------------------------------
set /p DOCKER_USER="Digite seu usuario do Docker Hub: "
set /p VERSION="Digite a NOVA versao da imagem (ex: v1.1): "

REM Cole aqui a URL gerada pelo seu Portainer
set WEBHOOK_URL="https://portainer.techrocket.site/api/stacks/webhooks/408f0016-b38b-456b-84fc-d745a8b59638"

echo.
echo ========================================================
echo Compilando imagem do Backend (Tags: %VERSION% e latest)...
echo ========================================================
docker build -t %DOCKER_USER%/ingles-proposito-backend:%VERSION% -t %DOCKER_USER%/ingles-proposito-backend:latest ./backend

echo.
echo ========================================================
echo Compilando imagem do Frontend (Tags: %VERSION% e latest)...
echo ========================================================
docker build -t %DOCKER_USER%/ingles-proposito-frontend:%VERSION% -t %DOCKER_USER%/ingles-proposito-frontend:latest ./frontend

echo.
echo ========================================================
echo Enviando imagens para o Docker Hub...
echo ========================================================
docker push %DOCKER_USER%/ingles-proposito-backend:%VERSION%
docker push %DOCKER_USER%/ingles-proposito-backend:latest
docker push %DOCKER_USER%/ingles-proposito-frontend:%VERSION%
docker push %DOCKER_USER%/ingles-proposito-frontend:latest

echo.
echo ========================================================
echo Avisando o Portainer para atualizar a Stack...
echo ========================================================
curl -X POST %WEBHOOK_URL%

REM Salva a nova versao no arquivo para a proxima vez
echo %VERSION%> %ARQUIVO_VERSAO%

echo.
echo.
echo ========================================================
echo Sucesso! Tudo atualizado no Docker Hub e no Portainer.
echo ========================================================
pause