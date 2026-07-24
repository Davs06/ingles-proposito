import React, { useState } from 'react';
import { Mail, X, Chrome, CheckCircle, Shield, BookOpen } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'teacher'
  const [loading, setLoading] = useState(false);
  const [sentMagicLink, setSentMagicLink] = useState(false);

  if (!isOpen) return null;

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    if (isSupabaseConfigured()) {
      const redirectPath = selectedRole === 'teacher' ? '/professor' : '/aluno';
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + redirectPath,
          data: { role: selectedRole }
        }
      });
      if (error) {
        alert('Erro ao enviar Magic Link: ' + error.message);
      } else {
        setSentMagicLink(true);
      }
    } else {
      setTimeout(() => {
        setSentMagicLink(true);
        setTimeout(() => {
          onLoginSuccess({
            email,
            full_name: email.split('@')[0],
            role: selectedRole
          });
          onClose();
        }, 1200);
      }, 600);
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    if (isSupabaseConfigured()) {
      const redirectPath = selectedRole === 'teacher' ? '/professor' : '/aluno';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + redirectPath,
          data: { role: selectedRole }
        }
      });
      if (error) {
        if (error.message?.includes('provider is not enabled') || error.code === 400 || error.status === 400) {
          alert('O provedor de login com o Google ainda não foi ativado no painel do Supabase.\n\nPara ativar:\n1. Acesse o Supabase Dashboard > Authentication > Providers\n2. Ative a opção "Enable Google provider"\n3. Preencha o Client ID e Client Secret do Google.');
        } else {
          alert('Erro no Login Google: ' + error.message);
        }
      }
    } else {
      alert('Supabase não configurado no .env. Por favor, adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
    }
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Autenticação & Perfis</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
              Projeto gratuito promovido pela <strong>PIB São Miguel Paulista</strong>
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`btn btn-sm ${selectedRole === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <BookOpen size={14} /> Sou Aluno
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`btn btn-sm ${selectedRole === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Shield size={14} /> Sou Professor / Admin
          </button>
        </div>

        {sentMagicLink ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle size={48} color="var(--accent-success)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Magic Link Enviado!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Verifique sua caixa de entrada no e-mail <strong>{email}</strong> para acessar como <strong>{selectedRole === 'teacher' ? 'Professor' : 'Aluno'}</strong> sem senha.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Google OAuth Button */}
            <button 
              onClick={handleGoogleAuth} 
              className="btn btn-secondary" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '10px 16px', fontWeight: '600', background: '#fff', color: '#1f2937', border: '1px solid #e5e7eb' }}
            >
              <Chrome size={18} color="#4285F4" /> Entrar com Conta Google ({selectedRole === 'teacher' ? 'Prof' : 'Aluno'})
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ou e-mail sem senha</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                <Mail size={16} /> {loading ? 'Enviando Link...' : 'Enviar Magic Link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}



