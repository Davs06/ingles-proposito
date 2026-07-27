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
    CREATE TYPE exercise_type AS ENUM ('multiple_choice', 'fill_in_blank', 'discursive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'discursive';


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
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, docente, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    false,      -- Sempre por padrão docente = false
    'student'::public.user_role  -- Sempre por padrão role = student
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user trigger error: %', SQLERRM;
  RETURN NEW;
END;
$$;

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

-- 11. NOTIFICAÇÕES DO SISTEMA E HOMEWORK
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL = para todos os alunos
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'new_homework', -- 'new_homework', 'new_material', 'system'
    is_read BOOLEAN NOT NULL DEFAULT false,
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
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura global de materiais" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Gestão de materiais por docentes" ON public.materials FOR ALL USING (public.is_teacher_or_admin());

CREATE POLICY "Leitura global de notificacoes" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Gestão de notificacoes por docentes" ON public.notifications FOR ALL USING (public.is_teacher_or_admin());


-- ==========================================
-- SUPABASE STORAGE BUCKETS (gallery-photos & lessons-pdf)
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('lessons-pdf', 'lessons-pdf', true),
       ('gallery-photos', 'gallery-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de acesso público para o bucket lessons-pdf
CREATE POLICY "Leitura pública lessons-pdf" ON storage.objects FOR SELECT USING (bucket_id = 'lessons-pdf');
CREATE POLICY "Upload permitido lessons-pdf" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lessons-pdf');
CREATE POLICY "Exclusão permitida lessons-pdf" ON storage.objects FOR DELETE USING (bucket_id = 'lessons-pdf');

-- Políticas de acesso público para o bucket gallery-photos
CREATE POLICY "Leitura pública gallery-photos" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-photos');
CREATE POLICY "Upload permitido gallery-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-photos');
CREATE POLICY "Exclusão permitida gallery-photos" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-photos');



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


