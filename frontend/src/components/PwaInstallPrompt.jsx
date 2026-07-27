import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // 1. Verifica se o app já está rodando instalado em modo Standalone (PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // Se já estiver instalado como app, não exibe o banner
    }

    // 2. Detecta se é dispositivo iOS (Safari não dispara beforeinstallprompt nativo)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. Verifica se o usuário já dispensou a instalação no primeiro acesso
    const isDismissed = localStorage.getItem('ingles_proposito_pwa_dismissed');

    // 4. Captura o evento nativo do navegador para instalação PWA (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Exibe o popup no primeiro acesso após um pequeno delay agradável
      if (!isDismissed) {
        setTimeout(() => setIsVisible(true), 1500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // No iOS ou navegadores que não dispararam beforeinstallprompt imediatamente, exibe se for o 1º acesso
    if (isIosDevice && !isDismissed) {
      setTimeout(() => setIsVisible(true), 1500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Dispara a caixa de diálogo nativa de instalação do Chrome / Edge / Android
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        toast.success('App instalado na Tela Inicial com sucesso! 🎉');
        localStorage.setItem('ingles_proposito_pwa_dismissed', 'installed');
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // Exibe instrução de como adicionar na tela inicial se o evento nativo for bloqueado pelo navegador (ex: HTTP)
      setShowIosInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('ingles_proposito_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: '480px',
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        borderRadius: '20px',
        padding: '18px 20px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(139, 92, 246, 0.25)',
        animation: 'slideDownPwa 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <style>{`
        @keyframes slideDownPwa {
          0% { opacity: 0; transform: translate(-50%, -40px) scale(0.95); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>

      {/* Header do Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/proposito do ingles.jpg"
            alt="App Logo"
            onError={(e) => { e.target.src = '/icon.svg'; }}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              background: '#0f172a',
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.98rem', color: '#f8fafc' }}>
                Propósito do Inglês
              </span>
              <span className="tag tag-purple" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                App PWA
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Instale o aplicativo na sua Tela Inicial
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
          title="Fechar"
        >
          <X size={15} />
        </button>
      </div>

      {/* Benefícios Rápidos */}
      {!showIosInstructions ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={14} color="#8b5cf6" />
              <span>Acesso rápido com 1 clique sem precisar abrir o navegador</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Smartphone size={14} color="#3b82f6" />
              <span>Prática de Speaking com IA e lições otimizadas para celular</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleInstallClick}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '0.84rem',
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-primary) 100%)',
                boxShadow: '0 6px 16px -4px rgba(139,92,246,0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} /> Baixar e Adicionar à Tela Inicial
            </button>
            <button
              onClick={handleDismiss}
              className="btn btn-secondary"
              style={{ padding: '10px 14px', fontSize: '0.82rem' }}
            >
              Agora não
            </button>
          </div>
        </>
      ) : (
        /* Instruções Específicas para iPhone/iOS Safari */
        <div style={{ marginTop: '14px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Share size={15} color="#3b82f6" /> {isIos ? 'Passos para instalar no iPhone (Safari):' : 'Como adicionar o app à sua Tela Inicial:'}
          </div>
          {isIos ? (
            <ol style={{ paddingLeft: '20px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Toque no botão <strong>Compartilhar</strong> <Share size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> na barra inferior do Safari.</li>
              <li>Role a lista de opções para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />.</li>
              <li>Confirme clicando em <strong>"Adicionar"</strong> no canto superior direito.</li>
            </ol>
          ) : (
            <ol style={{ paddingLeft: '20px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Clique nos <strong>3 pontinhos (⋮)</strong> no menu do seu navegador (canto superior direito).</li>
              <li>Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.</li>
              <li>Confirme para criar o ícone do <strong>Propósito do Inglês</strong> no seu celular/computador!</li>
            </ol>
          )}
          <button
            onClick={handleDismiss}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', marginTop: '12px', padding: '8px' }}
          >
            Entendido!
          </button>
        </div>
      )}
    </div>
  );
}
