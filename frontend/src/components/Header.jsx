import React from 'react';
import { BookOpen, User, Sun, Moon, Shield, LogOut } from 'lucide-react';

export default function Header({ user, onOpenAuth, onLogout, role, setRole, theme, toggleTheme }) {
  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div 
          style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '800',
            fontSize: '1.2rem'
          }}
        >
          IP
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', lineHeight: '1.1', fontWeight: '800' }}>
            Inglês com <span style={{ color: 'var(--accent-primary)' }}>Propósito</span>
          </h1>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
            PIB São Miguel Paulista
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', display: 'flex' }}>
          <button
            onClick={() => setRole('student')}
            className={`btn btn-sm ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.75rem', padding: '5px 12px' }}
          >
            <BookOpen size={14} /> Aluno (PWA)
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`btn btn-sm ${role === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.75rem', padding: '5px 12px' }}
          >
            <Shield size={14} /> Professor / Admin
          </button>
        </div>

        <button 
          onClick={toggleTheme} 
          className="btn btn-secondary btn-sm"
          style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
          title="Alternar Tema"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '0.85rem', textAlign: 'right', display: 'none', sm: 'block' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.full_name || user.email}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{role === 'teacher' ? 'Docente / Admin' : 'Estudante'}</div>
            </div>
            <button onClick={onLogout} className="btn btn-secondary btn-sm" title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn btn-primary btn-sm">
            <User size={15} /> Entrar
          </button>
        )}
      </div>
    </header>
  );
}
