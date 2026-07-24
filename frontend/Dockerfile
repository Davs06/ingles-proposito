# Multi-stage Dockerfile para o Frontend PWA & Dashboard (Nginx)
# Stage 1: Build da Aplicação React/Vite
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve com Nginx de Alta Segurança (Non-root user)
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Copiar a configuração personalizada do Nginx para suporte a SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do stage anterior
COPY --from=builder /app/dist .

# Configurar permissões para execução sem privilégios root
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html /etc/nginx/conf.d

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

