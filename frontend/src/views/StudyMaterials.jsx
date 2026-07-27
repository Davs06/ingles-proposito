import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Image as ImageIcon, Download, ExternalLink, Search, Filter, Sparkles, FolderDown } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export const INITIAL_MATERIALS = [];

export default function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [previewMaterial, setPreviewMaterial] = useState(null);

  useEffect(() => {
    async function loadMaterialsFromDb() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) {
          setMaterials(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar materiais do Supabase:', err);
      }
    }
    loadMaterialsFromDb();
  }, []);

  const categories = ['Todos', 'Apostila', 'Guia Gramatical', 'Vocabulário', 'Exercício Extra'];

  const filteredMaterials = materials.filter((item) => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="tag tag-blue"><BookOpen size={13} /> Acervo Acadêmico</span>
          <span className="tag tag-green">Bucket PDF & Mídia</span>
        </div>
        <h2 style={{ fontSize: '1.45rem', marginBottom: '6px' }}>Materiais Didáticos & Apostilas em PDF</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '650px', lineHeight: '1.5' }}>
          Acesse e faça o download das apostilas oficiais, guias gramaticais, tabelas de vocabulário e exercícios de apoio do projeto <strong>Propósito do Inglês — PIB São Miguel</strong>.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar apostila ou guia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', fontSize: '0.82rem', height: '36px' }}
            />
          </div>
        </div>
      </div>

      {/* Materials Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <FolderDown size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Nenhum material encontrado</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tente buscar com outro termo ou selecione uma categoria diferente.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredMaterials.map((item) => {
            const isPdf = item.file_type === 'pdf' || item.file_url.endsWith('.pdf');
            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '14px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className={`tag ${isPdf ? 'tag-red' : 'tag-green'}`} style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isPdf ? <FileText size={13} /> : <ImageIcon size={13} />}
                      {isPdf ? 'Documento PDF' : 'Imagem / Infográfico'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.category}</span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', lineHeight: '1.35', color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setPreviewMaterial(item)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem' }}
                  >
                    <ExternalLink size={14} /> Visualizar
                  </button>
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '8px 12px', fontSize: '0.78rem' }}
                    title="Baixar Arquivo"
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="modal-overlay" onClick={() => setPreviewMaterial(null)}>
          <div
            className="modal-content animate-fade-in"
            style={{ maxWidth: '850px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>{previewMaterial.title}</h3>
                <span className="tag tag-blue" style={{ fontSize: '0.7rem' }}>{previewMaterial.category}</span>
              </div>
              <button onClick={() => setPreviewMaterial(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                Fechar
              </button>
            </div>

            <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              {previewMaterial.file_type === 'image' || previewMaterial.file_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                <img
                  src={previewMaterial.file_url}
                  alt={previewMaterial.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <iframe
                  src={previewMaterial.file_url}
                  title={previewMaterial.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
