# 🎓 Propósito do Inglês | PIB São Miguel Paulista

> Plataforma educacional de alto impacto social, 100% gratuita para alunos da comunidade, promovida pela **Primeira Igreja Batista de São Miguel Paulista (PIB SMP)**.

---

## 📌 Visão Geral

O **Propósito do Inglês** é uma plataforma dividida em dois ambientes integrados:
1. **Módulo do Aluno (PWA Mobile-First)**: Experiência fluida para consumo de videoaulas, leitura de apostilas, resolução de homeworks e prática de conversação/pronúncia impulsionada por **Inteligência Artificial (Google Gemini)**.
2. **Painel do Professor/Admin (Dashboard Desktop-First)**: Gestão de ensino completa (CRUD de trilhas, cadastro de videoaulas do YouTube, upload de apostilas em PDF e construtor dinâmico de exercícios).

---

## 🛠️ Fluxo de Build e Deploy via Docker Hub

Este projeto foi estruturado para publicar as imagens no **Docker Hub** e puxá-las diretamente na sua VPS.

### 1. Compilar e Enviar as Imagens para o Docker Hub

No seu computador local, execute o script de automação:

**Windows**:
```cmd
build-and-push.bat
```

**Linux / Mac**:
```bash
chmod +x build-and-push.sh
./build-and-push.sh
```

---

### 2. Deploy na VPS (Puxando as Imagens)

Na sua VPS (com Traefik configurado), navegue até a pasta do projeto e execute:

```bash
# 1. Defina seu usuário do Docker Hub no arquivo .env
echo "DOCKER_USER=seu-usuario-docker" >> .env

# 2. Puxe as imagens atualizadas do Docker Hub
docker compose -f compose.prod.yaml pull

# 3. Inicie os containers com zero downtime
docker compose -f compose.prod.yaml up -d
```

---

## 🚀 Como Executar para Testes Locais

Para rodar localmente na sua máquina sem necessidade de Traefik:

```bash
docker compose up -d --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend Healthcheck**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 🗄️ Configuração do Banco de Dados Supabase (Produção)

1. Acesse o console do seu projeto no **Supabase**.
2. Abra o **SQL Editor**.
3. Copie e cole o conteúdo do arquivo [supabase/schema.sql](file:///supabase/schema.sql) e clique em **Run**.
4. O script criará todas as tabelas, funções RLS, índices e populará a base com dados iniciais de demonstração.
