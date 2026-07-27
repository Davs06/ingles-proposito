import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mic, Image as ImageIcon, Layers, FileCheck, Users, LayoutGrid, FileText } from 'lucide-react';

export default function MobileNav({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const pathname = location.pathname;
  const isTeacher = pathname.startsWith('/professor');

  if (isTeacher) {
    const isAmbientes = pathname === '/professor' || pathname === '/professor/ambientes';
    const isTrilhas = pathname === '/professor/trilhas';
    const isExercicios = pathname === '/professor/exercicios';
    const isAlunos = pathname === '/professor/alunos';

    return (
      <nav className="mobile-bottom-nav">
        <button
          onClick={() => navigate('/professor/ambientes')}
          className={`nav-item ${isAmbientes ? 'active' : ''}`}
        >
          <LayoutGrid size={19} />
          <span>Ambientes</span>
        </button>
        <button
          onClick={() => navigate('/professor/trilhas')}
          className={`nav-item ${isTrilhas ? 'active' : ''}`}
        >
          <Layers size={19} />
          <span>Trilhas</span>
        </button>
        <button
          onClick={() => navigate('/professor/exercicios')}
          className={`nav-item ${isExercicios ? 'active' : ''}`}
        >
          <FileCheck size={19} />
          <span>Exercícios</span>
        </button>
        <button
          onClick={() => navigate('/professor/alunos')}
          className={`nav-item ${isAlunos ? 'active' : ''}`}
        >
          <Users size={19} />
          <span>Alunos</span>
        </button>
      </nav>
    );
  }

  const isDashboard = pathname === '/aluno' || pathname === '/aluno/dashboard' || pathname.startsWith('/aluno/aula');
  const isMaterials = pathname === '/aluno/materiais';
  const isSpeaking = pathname === '/aluno/speaking';
  const isGallery = pathname === '/aluno/galeria';

  return (
    <nav className="mobile-bottom-nav">
      <button
        onClick={() => navigate('/aluno')}
        className={`nav-item ${isDashboard ? 'active' : ''}`}
      >
        <BookOpen size={19} />
        <span>Trilhas</span>
      </button>

      <button
        onClick={() => navigate('/aluno/materiais')}
        className={`nav-item ${isMaterials ? 'active' : ''}`}
      >
        <FileText size={19} />
        <span>Apostilas</span>
      </button>

      <button
        onClick={() => navigate('/aluno/speaking')}
        className={`nav-item ${isSpeaking ? 'active' : ''}`}
      >
        <Mic size={19} />
        <span>Speaking</span>
      </button>

      <button
        onClick={() => navigate('/aluno/galeria')}
        className={`nav-item ${isGallery ? 'active' : ''}`}
      >
        <ImageIcon size={19} />
        <span>Galeria</span>
      </button>
    </nav>
  );
}
