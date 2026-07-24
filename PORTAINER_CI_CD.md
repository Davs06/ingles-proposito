# Documentação de CI/CD com Webhooks do Portainer & Docker Hub

Esta documentação descreve a esteira de deploy automático via Docker Hub e Portainer.

## Arquitetura do Fluxo

```
[ Local / Git Push ] ──> [ Build & Push to Docker Hub ]
                                     │
                                     ▼
                     [ Disparo de Webhook / Pull na VPS ] ──> [ Portainer / Docker Compose ]
```

## Como Usar com Portainer

1. Defina o repositório e imagem no Portainer:
   - Backend: `${DOCKER_USER}/ingles-proposito-backend:latest`
   - Frontend: `${DOCKER_USER}/ingles-proposito-frontend:latest`
2. Utilize o arquivo [compose.prod.yaml](file:///compose.prod.yaml) na Stack do Portainer.
3. Ative a opção **Automatic updates** via Webhook no Portainer.
