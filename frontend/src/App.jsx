import React, { useState } from 'react';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import AuthModal from './components/AuthModal';
import StudentDashboard from './views/StudentDashboard';
import VirtualClassroom from './views/VirtualClassroom';
import SpeakingLab from './views/SpeakingLab';
import ExchangeGallery from './views/ExchangeGallery';
import TeacherDashboard from './views/TeacherDashboard';

import { INITIAL_TRACKS, INITIAL_GALLERY } from './services/mockData';

export default function App() {
  const [role, setRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [galleryItems, setGalleryItems] = useState(INITIAL_GALLERY);

  const [userProgress, setUserProgress] = useState({
    'c1111111-1111-1111-1111-111111111111': true
  });

  const [activeLessonContext, setActiveLessonContext] = useState(null);

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
    setActiveTab('classroom');
  };

  const handleCompleteLesson = (lessonId) => {
    setUserProgress((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  return (
    <div className="app-container">
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setUser(null)}
        role={role}
        setRole={(newRole) => {
          setRole(newRole);
          if (newRole === 'teacher') setActiveTab('manage-content');
          else setActiveTab('dashboard');
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="app-main-content" style={{ flex: 1, padding: '24px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {role === 'student' ? (
          <>
            {activeTab === 'dashboard' && (
              <StudentDashboard
                tracks={tracks}
                progress={userProgress}
                onSelectLesson={handleSelectLesson}
                onOpenSpeaking={() => setActiveTab('speaking')}
              />
            )}

            {activeTab === 'classroom' && activeLessonContext && (
              <VirtualClassroom
                lesson={activeLessonContext.lesson}
                track={activeLessonContext.track}
                module={activeLessonContext.module}
                onBack={() => setActiveTab('dashboard')}
                onCompleteLesson={handleCompleteLesson}
                isCompleted={!!userProgress[activeLessonContext.lesson.id]}
              />
            )}

            {activeTab === 'speaking' && <SpeakingLab />}

            {activeTab === 'gallery' && <ExchangeGallery galleryItems={galleryItems} />}
          </>
        ) : (
          <TeacherDashboard
            tracks={tracks}
            setTracks={setTracks}
            galleryItems={galleryItems}
            setGalleryItems={setGalleryItems}
          />
        )}
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} role={role} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => {
          setUser(userData);
          if (userData.role === 'teacher') {
            setRole('teacher');
            setActiveTab('manage-content');
          }
        }}
      />
    </div>
  );
}
