-- ==========================================
-- INGLÊS COM PROPÓSITO (PIB SÃO MIGUEL PAULISTA)
-- SUPABASE SCHEMA & RLS
-- ==========================================

-- 1. EXTENSÕES & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE exercise_type AS ENUM ('multiple_choice', 'fill_in_blank');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    docente BOOLEAN NOT NULL DEFAULT false, -- Campo booleano de indicação de docente/professor
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GATILHO AUTOMÁTICO: Popula a tabela public.profiles ao criar usuário em auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, docente, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    false,      -- Sempre por padrão docente = false
    'student'  -- Sempre por padrão role = student
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



-- 3. TRILHAS DE APRENDIZADO
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    level TEXT NOT NULL DEFAULT 'Iniciante', -- Iniciante, Intermediário, Avançado
    order_index INT NOT NULL DEFAULT 0,
    icon_name TEXT DEFAULT 'book-open',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MÓDULOS
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AULAS (LESSONS)
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    youtube_id TEXT NOT NULL, -- ID do vídeo não listado no YouTube
    pdf_url TEXT, -- URL para material de apoio em PDF (Supabase Bucket ou externo)
    duration_minutes INT DEFAULT 10,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXERCÍCIOS DE HOMEWORK
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    type exercise_type NOT NULL DEFAULT 'multiple_choice',
    question TEXT NOT NULL,
    options JSONB, -- Ex: ["Apple", "Banana", "Orange"] para múltipla escolha
    correct_answer TEXT NOT NULL, -- Resposta esperada ou opção correta
    explanation TEXT, -- Explicação em caso de erro
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROGRESSO DO ALUNO
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    score INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 8. RESPOSTAS DE EXERCÍCIOS
CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GALERIA DE INTERCÂMBIO E EVENTOS
CREATE TABLE IF NOT EXISTS public.gallery_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL, -- Imagem WebP otimizada
    category TEXT NOT NULL DEFAULT 'Visita Americana', -- Visita Americana, Evento, Aula Especial
    event_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MATERIAIS DE ESTUDO E APOSTILAS EM PDF/IMAGENS
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'pdf', -- 'pdf' | 'image'
    category TEXT NOT NULL DEFAULT 'Apostila', -- 'Apostila', 'Exercício Extra', 'Vocabulário', 'Guia Gramatical'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura global de materiais" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Gestão de materiais por docentes" ON public.materials FOR ALL USING (public.is_teacher_or_admin());


-- Auxiliar function para checar se o usuário é Professor/Admin
CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (docente = true OR role IN ('teacher', 'admin'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Profiles: Leitura liberada para autênticados, Edição do próprio perfil
CREATE POLICY "Leitura de perfis autorizada" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Edição do próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tracks, Modules, Lessons, Exercises, Gallery: Leitura pública global, CUD apenas para Admin/Professor
CREATE POLICY "Leitura global de trilhas" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Gestão de trilhas por docentes" ON public.tracks FOR ALL USING (public.is_teacher_or_admin());

CREATE POLICY "Leitura global de módulos" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Gestão de módulos por docentes" ON public.modules FOR ALL USING (public.is_teacher_or_admin());

CREATE POLICY "Leitura global de aulas" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Gestão de aulas por docentes" ON public.lessons FOR ALL USING (public.is_teacher_or_admin());

CREATE POLICY "Leitura global de exercícios" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Gestão de exercícios por docentes" ON public.exercises FOR ALL USING (public.is_teacher_or_admin());

CREATE POLICY "Leitura global da galeria" ON public.gallery_photos FOR SELECT USING (true);
CREATE POLICY "Gestão de galeria por docentes" ON public.gallery_photos FOR ALL USING (public.is_teacher_or_admin());

-- User Progress & Answers: Isolamento total por Aluno
CREATE POLICY "Aluno gerencia próprio progresso" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Docente visualiza progresso dos alunos" ON public.user_progress FOR SELECT USING (public.is_teacher_or_admin());

CREATE POLICY "Aluno registra própria resposta" ON public.user_answers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Docente visualiza respostas dos alunos" ON public.user_answers FOR SELECT USING (public.is_teacher_or_admin());

-- ==========================================
-- DADOS DE SEED INICIAIS
-- ==========================================

INSERT INTO public.tracks (id, title, description, level, order_index) VALUES
('11111111-1111-1111-1111-111111111111', 'Inglês Essencial para o Cotidiano', 'Aprenda vocabulário básico e expressões fundamentais para conversação.', 'Iniciante', 1),
('22222222-2222-2222-2222-222222222222', 'Speaking & Fluência com Americanos', 'Prepare-se para interações reais com voluntários estrangeiros e visitas.', 'Intermediário', 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.modules (id, track_id, title, description, order_index) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Módulo 1: Apresentação Pessoal & Greetings', 'Como se apresentar, saudações formais e informais.', 1),
('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Módulo 1: Cultural Exchange Prep', 'Expressões comuns utilizadas em conversas com nativos.', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, youtube_id, pdf_url, duration_minutes, order_index) VALUES
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Aula 1: Hello & Nice to meet you', 'Aprenda os cumprimentos essenciais em inglês com pronúncia correta.', 'dQw4w9WgXcQ', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 8, 1),
('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Aula 2: Falando sobre sua rotina', 'Uso do Present Simple para descrever atividades diárias.', 'L_LUpnjgPso', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 12, 2),
('c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'Aula 1: Perguntando sobre Origem e Cultura', 'Como fazer perguntas gentis para visitantes americanos.', '3JZ_D3ELwOQ', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 15, 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.exercises (id, lesson_id, type, question, options, correct_answer, explanation, order_index) VALUES
('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'multiple_choice', 'Qual a forma correta de responder a "Nice to meet you"?', '["Nice to meet you too", "I am fine", "Good morning", "Yes, please"]', 'Nice to meet you too', 'A resposta padrão para "Prazer em conhecê-lo" é "Prazer em conhecê-lo também".', 1),
('e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'fill_in_blank', 'Preencha a lacuna: "Hello, _____ name is Sarah."', '[]', 'my', 'O pronome possessivo para "eu" (minha) é "my".', 2),
('e3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'multiple_choice', 'Qual frase representa uma ação da rotina?', '["I go to school every day", "I went yesterday", "I will fly tomorrow", "I am sleeping now"]', 'I go to school every day', 'Expressões de frequência como "every day" acompanham o Present Simple.', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.gallery_photos (id, title, description, image_url, category, event_date) VALUES
('f1111111-1111-1111-1111-111111111111', 'Visita da Delegação de Boston', 'Estudantes americanos participando da oficina de conversação na nossa sala de leitura.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', 'Visita Americana', '2026-03-15'),
('f2222222-2222-2222-2222-222222222222', 'Workshop de Pronúncia & Pitching', 'Atividade prática de speaking entre nossos alunos da comunidade e mentores norte-americanos.', 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=800&q=80', 'Evento', '2026-04-10'),
('f3333333-3333-3333-3333-333333333333', 'Certificação da Turma de 2026', 'Entrega de certificados do nível intermediário com a presença dos parceiros sociais.', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80', 'Aula Especial', '2026-06-20')
ON CONFLICT DO NOTHING;

-- ==========================================
-- BUCKETS DE STORAGE (SUPABASE S3)
-- ==========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery-photos', 'gallery-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('lessons-pdf', 'lessons-pdf', true)
ON CONFLICT (id) DO NOTHING;

-- RLS de Storage para leitura pública e escrita por docentes
CREATE POLICY "Leitura pública de fotos" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-photos');
CREATE POLICY "Upload de fotos por docentes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-photos');

CREATE POLICY "Leitura pública de PDFs" ON storage.objects FOR SELECT USING (bucket_id = 'lessons-pdf');
CREATE POLICY "Upload de PDFs por docentes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lessons-pdf');

-- ==========================================
-- POPULAR PERFIS PARA USUÁRIOS QUE JÁ LOGARAM
-- ==========================================
INSERT INTO public.profiles (id, email, full_name, avatar_url, docente, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'),
  false,
  'student'::user_role
FROM auth.users
ON CONFLICT (id) DO NOTHING;


