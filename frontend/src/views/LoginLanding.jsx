import React, { useState } from 'react';
import { Chrome, Lock, BookOpen, Mic, FileText, Image as ImageIcon, Sparkles, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export default function LoginLanding({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'teacher'
  const [loading, setLoading] = useState(false);

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
          toast.error('Provedor Google desativado nas configurações do Supabase Auth.');
        } else {
          toast.error('Erro no Login Google: ' + error.message);
        }
      }
    } else {
      // Simulação para modo de desenvolvimento/testes sem Supabase
      setTimeout(() => {
        toast.success('Modo de testes ativo! Login com Google simulado.');
        onLoginSuccess({
          id: 'demo-google-user',
          email: selectedRole === 'teacher' ? 'professor.demo@gmail.com' : 'aluno.demo@gmail.com',
          full_name: selectedRole === 'teacher' ? 'Professor Demo' : 'Aluno Demo',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          role: selectedRole,
          docente: selectedRole === 'teacher'
        });
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 60px 16px' }} className="animate-fade-in">
      {/* Restrict Access Notice Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}
      >
        <div style={{ background: 'var(--accent-primary)', color: '#fff', padding: '8px', borderRadius: '50%', display: 'flex', flexShrink: 0 }}>
          <Lock size={18} />
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
          <strong>Área de Conteúdo Restrita:</strong> Faça login com a sua <strong>Conta Google</strong> para ter acesso ilimitado às aulas, exercícios e materiais do curso.
        </div>
      </div>

      {/* Main Hero & Auth Card Section */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'center',
          marginBottom: '48px'
        }}
      >
        {/* Hero Left Content */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent-light)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: '700', marginBottom: '16px' }}>
            <Sparkles size={14} /> PIB São Miguel Paulista
          </div>
          
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px' }}>
            Aprenda Inglês com <span style={{ color: 'var(--accent-primary)' }}>Propósito</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Plataforma interativa completa para capacitação em língua inglesa. Acesse videoaulas, laboratório de pronúncia com inteligência artificial, materiais de estudo e acompanhamento.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <CheckCircle2 size={18} color="var(--accent-success)" />
              <span>100% Gratuito e Aberto para a Comunidade</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <CheckCircle2 size={18} color="var(--accent-success)" />
              <span>Trilhas de Aprendizado do Básico ao Avançado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <CheckCircle2 size={18} color="var(--accent-success)" />
              <span>Login Rápido e Seguro em 1 Clique com o Google</span>
            </div>
          </div>
        </div>

        {/* Login Box Right */}
        <div className="glass-panel" style={{ padding: '32px 24px', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
          <img
            src="/proposito do ingles.jpg"
            alt="Propósito do Inglês Logo"
            onError={(e) => { e.target.style.display = 'none'; }}
            style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', margin: '0 auto 16px auto', display: 'block' }}
          />

          <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Acessar Plataforma</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Selecione seu perfil e entre com sua conta Google
          </p>

          {/* Role Selector Tabs */}
          <div style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`btn btn-sm ${selectedRole === 'student' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.82rem', padding: '10px 12px' }}
            >
              <BookOpen size={15} /> Sou Aluno
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className={`btn btn-sm ${selectedRole === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.82rem', padding: '10px 12px' }}
            >
              <Shield size={15} /> Prof / Admin
            </button>
          </div>

          {/* Single Google Login Button */}
          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="btn" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px', 
              padding: '14px 20px', 
              fontSize: '0.95rem',
              fontWeight: '700', 
              background: '#ffffff', 
              color: '#1f2937', 
              border: '1px solid #e5e7eb',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            <Chrome size={22} color="#4285F4" />
            {loading ? 'Redirecionando...' : `Entrar com Google (${selectedRole === 'teacher' ? 'Professor' : 'Aluno'})`}
          </button>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '16px', lineHeight: '1.4' }}>
            🔒 Autenticação 100% segura via Google OAuth. Não guardamos sua senha.
          </p>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
          Recursos Exclusivos da Nossa Plataforma
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <BookOpen size={20} />
            </div>
            <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>Trilhas de Estudo</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Módulos estruturados com videoaulas dinâmicas e exercícios práticos de fixação.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Mic size={20} />
            </div>
            <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>Speaking Lab</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Laboratório de pronúncia em tempo real com avaliação de fala por áudio.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <FileText size={20} />
            </div>
            <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>Apostilas & PDFs</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Material de apoio digital completo disponível para visualização e download.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <ImageIcon size={20} />
            </div>
            <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>Galeria Intercâmbio</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Registros e experiências culturais compartilhadas pela nossa comunidade de alunos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
