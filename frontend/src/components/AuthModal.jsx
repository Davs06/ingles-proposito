import React, { useState } from 'react';
import { X, Chrome, Shield, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'teacher'
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
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
        setLoading(false);
        if (error.message?.includes('provider is not enabled') || error.code === 400 || error.status === 400) {
          toast.error('Provedor Google desativado no Supabase Authentication.');
        } else {
          toast.error('Erro no Login Google: ' + error.message);
        }
      }
    } else {
      setTimeout(() => {
        toast.success('Modo de testes ativo! Login simulado.');
        onLoginSuccess({
          id: 'demo-google-user',
          email: selectedRole === 'teacher' ? 'professor.demo@gmail.com' : 'aluno.demo@gmail.com',
          full_name: selectedRole === 'teacher' ? 'Professor Demo' : 'Aluno Demo',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          role: selectedRole,
          docente: selectedRole === 'teacher'
        });
        setLoading(false);
        onClose();
      }, 600);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Autenticação com Google</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
              Projeto promovido pela <strong>PIB São Miguel Paulista</strong>
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '20px' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Google OAuth Button */}
          <button 
            onClick={handleGoogleAuth} 
            disabled={loading}
            className="btn" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              fontWeight: '700', 
              background: '#fff', 
              color: '#1f2937', 
              border: '1px solid #e5e7eb',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <Chrome size={20} color="#4285F4" /> 
            {loading ? 'Redirecionando...' : `Entrar com Conta Google (${selectedRole === 'teacher' ? 'Prof' : 'Aluno'})`}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
            Acesso rápido, prático e 100% seguro sem senhas adicionais.
          </p>
        </div>
      </div>
    </div>
  );
}
