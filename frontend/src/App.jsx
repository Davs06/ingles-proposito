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

// Configurable list of authorized teacher/admin email addresses
const AUTHORIZED_TEACHER_EMAILS = (
  import.meta.env.VITE_TEACHER_EMAILS ||
  'professor@pibsmp.org,admin@pibsmp.org,professor.google@pibsmp.org'
)
  .split(',')
  .map((e) => e.trim().toLowerCase());

function determineUserRole(supabaseUser, requestedRole = null) {
  if (!supabaseUser || !supabaseUser.email) return 'student';
  const email = supabaseUser.email.toLowerCase();
  const metaRole = supabaseUser.user_metadata?.role;

  // Grant teacher role if explicitly listed in AUTHORIZED_TEACHER_EMAILS,
  // or if email contains keywords ('professor'/'admin'),
  // or if user authenticated selecting Teacher profile (metaRole === 'teacher')
  const isTeacher =
    AUTHORIZED_TEACHER_EMAILS.includes(email) ||
    email.includes('professor') ||
    email.includes('admin') ||
    metaRole === 'teacher' ||
    supabaseUser.user_metadata?.is_teacher === true;

  if (isTeacher) {
    return 'teacher';
  }

  return 'student';
}


function buildUserProfile(supabaseUser, fallbackRole = null) {
  if (!supabaseUser) return null;
  const meta = supabaseUser.user_metadata || {};

  const fullName =
    meta.full_name ||
    meta.name ||
    meta.custom_claims?.global_name ||
    (supabaseUser.email ? supabaseUser.email.split('@')[0] : 'Usuário');

  const avatarUrl =
    meta.avatar_url ||
    meta.picture ||
    meta.avatar ||
    null;

  const role = determineUserRole(supabaseUser, fallbackRole);

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: fullName,
    avatar_url: avatarUrl,
    role
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
        A área de gestão (<strong>/professor</strong>) é exclusiva para professores e administradores autorizados.
      </p>

      {user ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          Conectado como <strong>{user.full_name || user.email}</strong> (Perfil atual: <em>Estudante</em>). Se você é um professor, solicite autorização do seu e-mail junto à administração.
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

  // Sync Supabase Auth session & roles on startup
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(buildUserProfile(session.user));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(buildUserProfile(session.user));
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



