import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import AuthModal from './components/AuthModal';
import StudentDashboard from './views/StudentDashboard';
import VirtualClassroom from './views/VirtualClassroom';
import SpeakingLab from './views/SpeakingLab';
import ExchangeGallery from './views/ExchangeGallery';
import TeacherDashboard from './views/TeacherDashboard';

import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { INITIAL_TRACKS, INITIAL_GALLERY } from './services/mockData';

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
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '36px 24px',
        maxWidth: '560px',
        margin: '40px auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4px'
        }}
      >
        <Lock size={28} />
      </div>

      <h2 style={{ fontSize: '1.4rem' }}>Acesso Restrito ao Corpo Docente</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
        A área de gestão (<strong>/professor</strong>) é exclusiva para professores e administradores autorizados no banco de dados.
      </p>

      {user ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          Conectado como <strong>{user.full_name || user.email}</strong> (Perfil atual: <em>Estudante</em>). Para se tornar um docente, solicite a alteração do campo <code>docente = true</code> no sistema.
        </div>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '10px', width: '100%' }}>
        <button onClick={onOpenAuth} className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
          <Shield size={15} /> Autenticar como Professor
        </button>
        <button onClick={() => navigate('/aluno')} className="btn btn-secondary btn-sm" style={{ padding: '8px 16px' }}>
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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [galleryItems, setGalleryItems] = useState(INITIAL_GALLERY);

  const [userProgress, setUserProgress] = useState({
    'c1111111-1111-1111-1111-111111111111': true
  });

  const [activeLessonContext, setActiveLessonContext] = useState(null);

  // Sync Supabase Auth session & DB roles on startup
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const profile = await fetchUserProfileFromDb(session.user);
          setUser(profile);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await fetchUserProfileFromDb(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);



  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    navigate('/aluno');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  const handleSelectLesson = (lesson, track, module) => {
    setActiveLessonContext({ lesson, track, module });
    navigate('/aluno/aula');
  };

  const handleCompleteLesson = (lessonId) => {
    setUserProgress((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
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
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="app-main-content">
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
            element={<SpeakingLab />}
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
      </main>

      <MobileNav />

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
    </div>
  );
}



