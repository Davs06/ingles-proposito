import React from 'react';
import { X, ExternalLink, FileText } from 'lucide-react';

export default function PdfViewerModal({ pdfUrl, title, isOpen, onClose }) {
  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-fade-in" 
        style={{ maxWidth: '900px', height: '85vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText color="var(--accent-primary)" size={22} />
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>{title || 'Material Complementar em PDF'}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visualizador Integrado</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary btn-sm"
              title="Abrir em Nova Guia"
            >
              <ExternalLink size={14} /> <span className="hide-mobile">Abrir Externamente</span>
            </a>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#fff' }}>
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            title={title}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
