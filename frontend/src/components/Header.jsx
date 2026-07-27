import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpen, User, Sun, Moon, Shield, LogOut, Bell, CheckCheck, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const INITIAL_NOTIFS = [
  {
    id: 'n1',
    title: 'Novo Homework Disponível! 📝',
    message: 'Novos exercícios foram adicionados no módulo de conversação. Acesse suas aulas para responder!',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

export default function Header({ user, onOpenAuth, onLogout, theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/professor');
  const role = isTeacher ? 'teacher' : 'student';

  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  useEffect(() => {
    async function loadNotifications() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setNotifications(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar notificações do Supabase:', err);
      }
    }
    loadNotifications();

    // Inscrição Realtime no Supabase para receber novos homeworks instantaneamente na tela de bloqueio
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const newNotif = payload.new;
        setNotifications((prev) => [newNotif, ...prev]);

        // Dispara notificação nativa no SO/Tela de Bloqueio do celular se a permissão foi concedida
        if ('Notification' in window && Notification.permission === 'granted') {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(newNotif.title || 'Novo Homework Disponível! 📝', {
                body: newNotif.message,
                icon: '/pwa-192.png',
                vibrate: [200, 100, 200],
                data: { url: '/aluno' }
              });
            });
          } else {
            new Notification(newNotif.title || 'Novo Homework Disponível! 📝', {
              body: newNotif.message
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleEnableMobilePush = async () => {
    if (!('Notification' in window)) {
      alert('Notificações nativas não são suportadas neste navegador.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushEnabled(true);
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification('Propósito do Inglês 🔔', {
            body: 'Notificações na Tela de Bloqueio ativadas com sucesso! Você receberá avisos de novos homeworks.',
            icon: '/icon.svg',
            vibrate: [200, 100, 200]
          });
        }
      } else {
        alert('Permissão de notificação negada nas configurações do seu celular.');
      }
    } catch (err) {
      console.warn('Erro de permissão push:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      } catch (err) {
        console.warn('Erro ao marcar notificações como lidas:', err);
      }
    }
  };


  return (
    <header className="top-navbar">
      <Link to="/aluno" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
        <img
          src="/proposito do ingles.jpg"
          alt="Propósito do Inglês Logo"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            objectFit: 'cover',
            flexShrink: 0
          }}
        />
        <div 
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', 
            display: 'none', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '800',
            fontSize: '1.1rem',
            flexShrink: 0
          }}
        >
          PI
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 className="brand-title-heading">
            Propósito do <span style={{ color: 'var(--accent-primary)' }}>Inglês</span>
          </h1>
          <div className="brand-subtitle" style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700', whiteSpace: 'nowrap' }}>
            PIB São Miguel Paulista
          </div>
        </div>

      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', flexShrink: 0 }}>
        <div className="nav-role-switcher" style={{ background: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', display: 'flex', gap: '2px' }}>

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

        {/* Notification Bell Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifPanel(!showNotifPanel)} 
            className="btn btn-secondary btn-sm"
            style={{ width: '34px', height: '34px', minHeight: '34px', padding: 0, borderRadius: '50%', flexShrink: 0, position: 'relative' }}
            title="Central de Notificações de Homework"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  borderRadius: '99px',
                  padding: '2px 5px',
                  lineHeight: '1',
                  border: '2px solid var(--bg-card)'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifPanel && (
            <div className="glass-panel animate-fade-in notification-dropdown-panel">

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  Notificações ({unreadCount} não lidas)
                </strong>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                    <CheckCheck size={12} /> Marcar lidas
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                    Nenhuma notificação recente.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate('/aluno');
                        setShowNotifPanel(false);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        background: item.is_read ? 'var(--bg-secondary)' : 'rgba(37, 99, 235, 0.12)',
                        border: item.is_read ? '1px solid var(--border-color)' : '1px solid rgba(37, 99, 235, 0.3)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                        {item.title}
                      </strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {!pushEnabled && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={handleEnableMobilePush}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', fontSize: '0.74rem', justifyContent: 'center' }}
                  >
                    <Bell size={13} /> Ativar Notificações na Tela de Bloqueio
                  </button>
                </div>
              )}
            </div>

          )}
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


