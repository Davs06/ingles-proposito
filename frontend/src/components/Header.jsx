import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpen, User, Sun, Moon, Shield, LogOut } from 'lucide-react';

export default function Header({ user, onOpenAuth, onLogout, theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/professor');
  const role = isTeacher ? 'teacher' : 'student';

  return (
    <header className="top-navbar">
      <Link to="/aluno" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
        <div 
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '800',
            fontSize: '1.1rem',
            flexShrink: 0
          }}
        >
          IP
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: '1.05rem', lineHeight: '1.1', fontWeight: '800', whiteSpace: 'nowrap' }}>
            Inglês com <span style={{ color: 'var(--accent-primary)' }}>Propósito</span>
          </h1>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700', whiteSpace: 'nowrap' }}>
            PIB São Miguel Paulista
          </div>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', display: 'flex', gap: '2px' }}>
          <button
            onClick={() => navigate('/aluno')}
            className={`btn btn-sm ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.72rem', padding: '4px 10px', minHeight: '30px' }}
            title="Área do Aluno (/aluno)"
          >
            <BookOpen size={13} />
            <span className="hide-mobile">Aluno</span>
          </button>
          <button
            onClick={() => navigate('/professor')}
            className={`btn btn-sm ${role === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.72rem', padding: '4px 10px', minHeight: '30px' }}
            title="Área do Professor / Admin (/professor)"
          >
            <Shield size={13} />
            <span className="hide-mobile">Prof / Admin</span>
          </button>
        </div>

        <button 
          onClick={toggleTheme} 
          className="btn btn-secondary btn-sm"
          style={{ width: '34px', height: '34px', minHeight: '34px', padding: 0, borderRadius: '50%', flexShrink: 0 }}
          title="Alternar Tema"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || 'Perfil'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--accent-primary)',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
            ) : null}
            <div className="hide-mobile" style={{ fontSize: '0.8rem', textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name || user.email}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {role === 'teacher' ? 'Docente / Admin' : 'Estudante'}
              </div>
            </div>
            <button onClick={onLogout} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px', minHeight: '34px' }} title="Sair">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', minHeight: '34px' }}>
            <User size={14} /> <span className="hide-mobile">Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
}


