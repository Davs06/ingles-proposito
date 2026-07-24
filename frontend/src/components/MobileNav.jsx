import React from 'react';
import { BookOpen, Mic, Image as ImageIcon } from 'lucide-react';

export default function MobileNav({ activeTab, setActiveTab, role }) {
  if (role === 'teacher') {
    return (
      <nav className="mobile-bottom-nav">
        <button
          onClick={() => setActiveTab('manage-content')}
          className={`nav-item ${activeTab === 'manage-content' ? 'active' : ''}`}
        >
          <BookOpen size={20} />
          <span>Conteúdo</span>
        </button>
        <button
          onClick={() => setActiveTab('manage-gallery')}
          className={`nav-item ${activeTab === 'manage-gallery' ? 'active' : ''}`}
        >
          <ImageIcon size={20} />
          <span>Galeria</span>
        </button>
      </nav>
    );
  }

  return (
    <nav className="mobile-bottom-nav">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
      >
        <BookOpen size={20} />
        <span>Trilhas</span>
      </button>

      <button
        onClick={() => setActiveTab('speaking')}
        className={`nav-item ${activeTab === 'speaking' ? 'active' : ''}`}
      >
        <Mic size={20} />
        <span>Speaking IA</span>
      </button>

      <button
        onClick={() => setActiveTab('gallery')}
        className={`nav-item ${activeTab === 'gallery' ? 'active' : ''}`}
      >
        <ImageIcon size={20} />
        <span>Galeria</span>
      </button>
    </nav>
  );
}
