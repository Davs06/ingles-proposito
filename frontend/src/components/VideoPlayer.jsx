import React from 'react';

export default function VideoPlayer({ youtubeId, title }) {
  if (!youtubeId) {
    return (
      <div 
        style={{ 
          aspectRatio: '16/9', 
          background: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--text-muted)' 
        }}
      >
        Nenhum vídeo associado a esta aula.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=0`}
          title={title || 'Aula em Vídeo'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0
          }}
        />
      </div>
    </div>
  );
}
