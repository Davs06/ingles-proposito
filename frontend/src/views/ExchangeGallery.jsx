import React, { useState } from 'react';
import { Image as ImageIcon, Calendar, Filter, X, ZoomIn } from 'lucide-react';

export default function ExchangeGallery({ galleryItems }) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [activePhoto, setActivePhoto] = useState(null);

  const categories = ['Todas', 'Visita Americana', 'Evento', 'Aula Especial'];

  const filteredItems = selectedCategory === 'Todas'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.08) 100%)',
          borderColor: 'rgba(16,185,129,0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ImageIcon color="var(--accent-success)" size={24} />
          <span className="tag tag-green">Intercâmbio & Vivência • PIB São Miguel Paulista</span>
        </div>
        <h2 style={{ fontSize: '1.5rem' }}>Galeria de Visitas e Eventos da Escola</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Registros das interações entre alunos do projeto <strong>Inglês com Propósito</strong> e voluntários parceiros.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <Filter size={16} color="var(--text-muted)" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid-responsive">
        {filteredItems.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setActivePhoto(photo)}
            className="glass-panel glass-panel-hover"
            style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ position: 'relative', width: '100%', paddingTop: '65%', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
              <img
                src={photo.image_url}
                alt={photo.title}
                loading="lazy"
                decoding="async"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease'
                }}
              />
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px', 
                  background: 'rgba(0,0,0,0.6)', 
                  padding: '4px 8px', 
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Calendar size={12} /> {photo.event_date}
              </div>
            </div>

            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="tag tag-blue" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>{photo.category}</span>
                <h4 style={{ fontSize: '1rem', marginTop: '4px' }}>{photo.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {photo.description}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '12px', fontWeight: '600' }}>
                <ZoomIn size={14} /> Expandir Foto
              </div>
            </div>
          </div>
        ))}
      </div>

      {activePhoto && (
        <div className="modal-overlay" onClick={() => setActivePhoto(null)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span className="tag tag-green">{activePhoto.category}</span>
                <h3 style={{ fontSize: '1.2rem', marginTop: '4px' }}>{activePhoto.title}</h3>
              </div>
              <button onClick={() => setActivePhoto(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '14px', background: '#000', maxHeight: '500px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {activePhoto.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
