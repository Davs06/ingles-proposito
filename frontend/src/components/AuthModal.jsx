import React, { useState } from 'react';
import { Mail, Sparkles, X, Chrome, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentMagicLink, setSentMagicLink] = useState(false);

  if (!isOpen) return null;

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        alert('Erro ao enviar Magic Link: ' + error.message);
      } else {
        setSentMagicLink(true);
      }
    } else {
      setTimeout(() => {
        setSentMagicLink(true);
        setTimeout(() => {
          onLoginSuccess({ email, full_name: email.split('@')[0], role: 'student' });
          onClose();
        }, 1200);
      }, 600);
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } else {
      onLoginSuccess({ email: 'aluno.demo@pibsmp.org', full_name: 'Aluno Demonstrativo', role: 'student' });
      onClose();
    }
  };

  const handleDemoStudent = () => {
    onLoginSuccess({ email: 'aluno@pibsmp.org', full_name: 'João Silva (Aluno)', role: 'student' });
    onClose();
  };

  const handleDemoTeacher = () => {
    onLoginSuccess({ email: 'professor@pibsmp.org', full_name: 'Prof. Carlos Eduardo', role: 'teacher' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Acesso sem Fricção</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Projeto 100% gratuito promovido pela <strong>PIB São Miguel Paulista</strong>
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {sentMagicLink ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle size={48} color="var(--accent-success)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Magic Link Enviado!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Verifique sua caixa de entrada no e-mail <strong>{email}</strong> para acessar instantaneamente sem senha.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Entrar via Magic Link (E-mail sem Senha)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                <Mail size={16} /> {loading ? 'Enviando Link...' : 'Enviar Magic Link'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            <button onClick={handleGoogleAuth} className="btn btn-secondary" style={{ width: '100%' }}>
              <Chrome size={18} color="#4285F4" /> Entrar com Conta Google
            </button>

            <div style={{ marginTop: '12px', padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px border-color' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> ACESSO RÁPIDO PARA AVALIAÇÃO DEMO
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={handleDemoStudent} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  Entrar como Aluno
                </button>
                <button onClick={handleDemoTeacher} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  Entrar como Professor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
