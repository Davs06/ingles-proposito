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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Panel */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.08) 100%)',
          borderColor: 'rgba(16,185,129,0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <ImageIcon color="var(--accent-success)" size={22} style={{ flexShrink: 0 }} />
          <span className="tag tag-green">Intercâmbio & Vivência • PIB São Miguel Paulista</span>
        </div>
        <h2 style={{ fontSize: '1.4rem' }}>Galeria de Visitas e Eventos da Escola</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', lineHeight: '1.4' }}>
          Registros das interações entre alunos do projeto <strong>Propósito do Inglês</strong> e voluntários parceiros.
        </p>
      </div>

      {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
      <div className="scroll-x-tabs" style={{ alignItems: 'center' }}>
        <Filter size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginRight: '4px' }} />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: '0.78rem', minHeight: '32px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Image Grid */}
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
                  top: '8px', 
                  right: '8px', 
                  background: 'rgba(0,0,0,0.65)', 
                  padding: '3px 8px', 
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.68rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Calendar size={11} /> {photo.event_date}
              </div>
            </div>

            <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="tag tag-blue" style={{ fontSize: '0.62rem', marginBottom: '4px' }}>{photo.category}</span>
                <h4 style={{ fontSize: '0.95rem', marginTop: '4px' }}>{photo.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {photo.description}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '10px', fontWeight: '600' }}>
                <ZoomIn size={13} /> Expandir Foto
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="modal-overlay" onClick={() => setActivePhoto(null)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span className="tag tag-green" style={{ fontSize: '0.68rem' }}>{activePhoto.category}</span>
                <h3 style={{ fontSize: '1.15rem', marginTop: '2px' }}>{activePhoto.title}</h3>
              </div>
              <button onClick={() => setActivePhoto(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '12px', background: '#000', maxHeight: '60vh', display: 'flex', justifyContent: 'center' }}>
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
              />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
              {activePhoto.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

