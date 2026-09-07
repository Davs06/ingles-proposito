import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import PwaInstallPrompt from './components/PwaInstallPrompt';

import MobileNav from './components/MobileNav';
import AuthModal from './components/AuthModal';
import LoginLanding from './views/LoginLanding';
import StudentDashboard from './views/StudentDashboard';
import VirtualClassroom from './views/VirtualClassroom';
import SpeakingLab from './views/SpeakingLab';
import ExchangeGallery from './views/ExchangeGallery';
import StudyMaterials from './views/StudyMaterials';
import TeacherDashboard from './views/TeacherDashboard';

import { supabase, isSupabaseConfigured } from './services/supabaseClient';

// Carrega o perfil do usuário a partir da tabela 'profiles' do banco de dados Supabase
async function fetchUserProfileFromDb(supabaseUser) {
  if (!supabaseUser) return null;
  const meta = supabaseUser.user_metadata || {};

  let isDocente = false;
  let dbFullName = null;
  let dbAvatarUrl = null;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('docente, role, full_name, avatar_url')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (profile) {
      isDocente = profile.docente === true || profile.role === 'teacher' || profile.role === 'admin';
      dbFullName = profile.full_name;
      dbAvatarUrl = profile.avatar_url;
    }
  } catch (err) {
    console.warn('Consulta à tabela profiles:', err);
  }

  // Fallback para metadados ou keywords no e-mail caso não haja registro na tabela
  const email = (supabaseUser.email || '').toLowerCase();
  if (!isDocente) {
    isDocente =
      meta.role === 'teacher' ||
      meta.docente === true ||
      meta.is_teacher === true ||
      email.includes('professor') ||
      email.includes('admin');
  }

  const fullName =
    dbFullName ||
    meta.full_name ||
    meta.name ||
    meta.custom_claims?.global_name ||
    (supabaseUser.email ? supabaseUser.email.split('@')[0] : 'Usuário');

  const avatarUrl =
    dbAvatarUrl ||
    meta.avatar_url ||
    meta.picture ||
    meta.avatar ||
    null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: fullName,
    avatar_url: avatarUrl,
    role: isDocente ? 'teacher' : 'student',
    docente: isDocente
  };
}

// Component to protect Teacher routes based on user role
function TeacherGuard({ user, onOpenAuth, children }) {
  const navigate = useNavigate();

  // If user is logged in as teacher, grant access
  if (user && user.role === 'teacher') {
    return children;
  }

  // Restricted Access Guard UI
  return (
    <div className="glass-panel animate-fade-in px-6 py-9 max-w-[560px] mx-auto text-center flex flex-col items-center gap-4 my-10">
      <div className="w-[60px] h-[60px] rounded-full bg-orange-600/15 text-orange-600 flex items-center justify-center mb-1">
        <Lock size={28} />
      </div>

      <h2 className="text-[1.4rem]">Acesso Restrito ao Corpo Docente</h2>
      <p className="text-secondary text-[0.88rem] leading-relaxed">
        A área de gestão (<strong>/professor</strong>) é exclusiva para professores e administradores autorizados no banco de dados.
      </p>

      {user ? (
        <div className="text-[0.8rem] text-muted bg-secondary py-2 px-3.5 rounded-sm border border-border">
          Conectado como <strong>{user.full_name || user.email}</strong> (Perfil atual: <em>Estudante</em>). Para se tornar um docente, solicite a alteração do campo <code>docente = true</code> no sistema.
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2.5 justify-center mt-2.5 w-full">
        <button onClick={onOpenAuth} className="btn btn-primary btn-sm px-4 py-2">
          <Shield size={15} /> Autenticar como Professor
        </button>
        <button onClick={() => navigate('/aluno')} className="btn btn-secondary btn-sm px-4 py-2">
          Voltar para Área do Aluno
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [tracks, setTracks] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);

  const [userProgress, setUserProgress] = useState({});

  const [activeLessonContext, setActiveLessonContext] = useState(null);

  // Sync Supabase Auth session & DB roles on startup
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const profile = await fetchUserProfileFromDb(session.user);
          setUser(profile);
        }
        setAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await fetchUserProfileFromDb(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Load gallery photos from Supabase DB on startup
  useEffect(() => {
    async function loadGalleryFromDb() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data } = await supabase
          .from('gallery_photos')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) {
          setGalleryItems(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar galeria do Supabase:', err);
      }
    }
    loadGalleryFromDb();
  }, []);

  // Load tracks & lessons from Supabase DB on startup
  useEffect(() => {
    async function loadTracksFromDb() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data: dbTracks } = await supabase
          .from('tracks')
          .select('*, modules(*, lessons(*, exercises(*)))')
          .order('order_index', { ascending: true });

        if (dbTracks) {
          const formattedTracks = dbTracks.map((t) => ({
            ...t,
            modules: (t.modules || [])
              .sort((a, b) => a.order_index - b.order_index)
              .map((m) => ({
                ...m,
                lessons: (m.lessons || [])
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((l) => ({
                    ...l,
                    exercises: (l.exercises || []).sort((a, b) => a.order_index - b.order_index)
                  }))
              }))
          }));
          setTracks(formattedTracks);
        }
      } catch (err) {
        console.warn('Erro ao carregar trilhas do Supabase:', err);
      }
    }
    loadTracksFromDb();
  }, []);

  // Load student progress from Supabase DB on login
  useEffect(() => {
    async function loadUserProgressFromDb() {
      if (!isSupabaseConfigured() || !user?.id) return;
      try {
        const { data: dbProgress } = await supabase
          .from('user_progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id);

        if (dbProgress && dbProgress.length > 0) {
          const progressMap = {};
          dbProgress.forEach((item) => {
            if (item.completed) {
              progressMap[item.lesson_id] = true;
            }
          });
          setUserProgress((prev) => ({ ...prev, ...progressMap }));
        }
      } catch (err) {
        console.warn('Erro ao carregar progresso:', err);
      }
    }
    loadUserProgressFromDb();
  }, [user?.id]);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    navigate('/aluno');
  };

  const handleSelectLesson = (lesson, track, module) => {
    setActiveLessonContext({ lesson, track, module });
    navigate('/aluno/aula');
  };

  const handleCompleteLesson = async (lessonId) => {
    const nextState = !userProgress[lessonId];
    setUserProgress((prev) => ({
      ...prev,
      [lessonId]: nextState
    }));

    if (isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from('user_progress').upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            completed: nextState,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,lesson_id' }
        );
      } catch (err) {
        console.warn('Erro ao salvar progresso no banco:', err);
      }
    }
  };

  // Helper to map teacher URL paths to activeTab
  const pathParts = location.pathname.split('/').filter(Boolean);
  const teacherActiveTab = pathParts[0] === 'professor' ? (pathParts[1] || 'environments') : 'environments';

  const handleTeacherTabChange = (newTab) => {
    navigate(`/professor/${newTab}`);
  };

  // Fallback lesson if activeLessonContext is not set yet
  const defaultLessonContext = activeLessonContext || {
    lesson: tracks[0]?.modules[0]?.lessons[0],
    track: tracks[0],
    module: tracks[0]?.modules[0]
  };

  return (
    <div className="app-container">
      <PwaInstallPrompt />
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="app-main-content">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <Loader2 size={32} className="animate-spin text-accent-primary" />
            <span className="text-[0.88rem] text-muted">Verificando autenticação...</span>
          </div>
        ) : !user ? (
          <LoginLanding onLoginSuccess={(userData) => setUser(userData)} />
        ) : (
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/aluno" replace />} />

            {/* Student routes */}
            <Route
              path="/aluno"
              element={
                <StudentDashboard
                  tracks={tracks}
                  progress={userProgress}
                  onSelectLesson={handleSelectLesson}
                  onOpenSpeaking={() => navigate('/aluno/speaking')}
                />
              }
            />
            <Route
              path="/aluno/trilhas"
              element={<Navigate to="/aluno" replace />}
            />
            <Route
              path="/aluno/speaking"
              element={<SpeakingLab user={user} />}
            />
            <Route
              path="/aluno/materiais"
              element={<StudyMaterials />}
            />
            <Route
              path="/aluno/galeria"
              element={<ExchangeGallery galleryItems={galleryItems} />}
            />

            <Route
              path="/aluno/aula"
              element={
                defaultLessonContext.lesson ? (
                  <VirtualClassroom
                    lesson={defaultLessonContext.lesson}
                    track={defaultLessonContext.track}
                    module={defaultLessonContext.module}
                    onBack={() => navigate('/aluno')}
                    onCompleteLesson={handleCompleteLesson}
                    isCompleted={!!userProgress[defaultLessonContext.lesson?.id]}
                  />
                ) : (
                  <Navigate to="/aluno" replace />
                )
              }
            />

            {/* Protected Teacher routes */}
            <Route
              path="/professor/*"
              element={
                <TeacherGuard user={user} onOpenAuth={() => setIsAuthOpen(true)}>
                  <TeacherDashboard
                    tracks={tracks}
                    setTracks={setTracks}
                    galleryItems={galleryItems}
                    setGalleryItems={setGalleryItems}
                    activeTab={teacherActiveTab}
                    setActiveTab={handleTeacherTabChange}
                  />
                </TeacherGuard>
              }
            />

            {/* Catch-all redirect to /aluno */}
            <Route path="*" element={<Navigate to="/aluno" replace />} />
          </Routes>
        )}
      </main>

      <MobileNav user={user} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => {
          setUser(userData);
          if (userData.role === 'teacher') {
            navigate('/professor');
          } else {
            navigate('/aluno');
          }
        }}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3800,
          style: {
            background: 'var(--bg-card, #1e293b)',
            color: 'var(--text-primary, #f8fafc)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
            borderRadius: 'var(--radius-md, 12px)',
            boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.45)',
            fontSize: '0.88rem',
            padding: '12px 16px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />
    </div>
  );
}
