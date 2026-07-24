import React, { useState } from 'react';
import { Plus, Trash2, Video, Layers, Save, X, Image as ImageIcon } from 'lucide-react';

export default function TeacherDashboard({ tracks, setTracks, galleryItems, setGalleryItems }) {
  const [activeTab, setActiveTab] = useState('tracks');
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');
  const [newTrackLevel, setNewTrackLevel] = useState('Iniciante');

  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonYoutubeId, setNewLessonYoutubeId] = useState('');
  const [newLessonPdfUrl, setNewLessonPdfUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(10);

  const [exerciseQuestion, setExerciseQuestion] = useState('');
  const [exerciseType, setExerciseType] = useState('multiple_choice');
  const [exerciseOptions, setExerciseOptions] = useState(['', '', '', '']);
  const [exerciseCorrectAnswer, setExerciseCorrectAnswer] = useState('');
  const [exerciseExplanation, setExerciseExplanation] = useState('');
  const [targetLessonForEx, setTargetLessonForEx] = useState('');

  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Visita Americana');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const handleCreateTrack = (e) => {
    e.preventDefault();
    if (!newTrackTitle) return;

    const newTrack = {
      id: Date.now().toString(),
      title: newTrackTitle,
      description: newTrackDesc,
      level: newTrackLevel,
      order_index: tracks.length + 1,
      modules: [
        {
          id: 'mod-' + Date.now(),
          title: 'Módulo 1: Introdução',
          description: 'Módulo inicial criado pelo professor',
          lessons: []
        }
      ]
    };

    setTracks([...tracks, newTrack]);
    setNewTrackTitle('');
    setNewTrackDesc('');
    setShowAddTrackModal(false);
  };

  const handleCreateLesson = (e) => {
    e.preventDefault();
    if (!newLessonTitle || !selectedModuleId) return;

    let youtubeId = newLessonYoutubeId.trim();
    if (youtubeId.includes('v=')) {
      youtubeId = youtubeId.split('v=')[1]?.split('&')[0];
    } else if (youtubeId.includes('youtu.be/')) {
      youtubeId = youtubeId.split('youtu.be/')[1]?.split('?')[0];
    }

    const newLesson = {
      id: 'c' + Date.now().toString().slice(-11),
      title: newLessonTitle,
      description: newLessonDesc,
      youtube_id: youtubeId || 'dQw4w9WgXcQ',
      pdf_url: newLessonPdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      duration_minutes: Number(newLessonDuration),
      exercises: []
    };

    const updatedTracks = tracks.map((track) => ({
      ...track,
      modules: track.modules.map((mod) => {
        if (mod.id === selectedModuleId) {
          return { ...mod, lessons: [...mod.lessons, newLesson] };
        }
        return mod;
      })
    }));

    setTracks(updatedTracks);
    setNewLessonTitle('');
    setNewLessonDesc('');
    setNewLessonYoutubeId('');
    setNewLessonPdfUrl('');
    setShowAddLessonModal(false);
  };

  const handleCreateExercise = (e) => {
    e.preventDefault();
    if (!exerciseQuestion || !targetLessonForEx) return;

    const newEx = {
      id: 'e' + Date.now().toString().slice(-11),
      type: exerciseType,
      question: exerciseQuestion,
      options: exerciseType === 'multiple_choice' ? exerciseOptions.filter(Boolean) : [],
      correct_answer: exerciseCorrectAnswer,
      explanation: exerciseExplanation
    };

    const updatedTracks = tracks.map((track) => ({
      ...track,
      modules: track.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((less) => {
          if (less.id === targetLessonForEx) {
            return { ...less, exercises: [...(less.exercises || []), newEx] };
          }
          return less;
        })
      }))
    }));

    setTracks(updatedTracks);
    setExerciseQuestion('');
    setExerciseCorrectAnswer('');
    setExerciseExplanation('');
    alert('Exercício adicionado com sucesso!');
  };

  const handleDeleteLesson = (lessonId) => {
    if (!confirm('Deseja realmente excluir esta aula?')) return;
    const updatedTracks = tracks.map((track) => ({
      ...track,
      modules: track.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.filter((l) => l.id !== lessonId)
      }))
    }));
    setTracks(updatedTracks);
  };

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newPhotoTitle || !newPhotoUrl) return;

    const newPhoto = {
      id: 'f' + Date.now().toString().slice(-11),
      title: newPhotoTitle,
      description: newPhotoDesc,
      image_url: newPhotoUrl,
      category: newPhotoCategory,
      event_date: new Date().toISOString().split('T')[0]
    };

    setGalleryItems([newPhoto, ...galleryItems]);
    setNewPhotoTitle('');
    setNewPhotoDesc('');
    setNewPhotoUrl('');
    alert('Foto adicionada à galeria!');
  };

  const allLessons = tracks.flatMap((t) => t.modules.flatMap((m) => m.lessons));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(16,185,129,0.08) 100%)' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="tag tag-blue">Painel Administrativo Desktop-First</span>
            <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>Gestão de Ensino & Mídia</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Gerencie trilhas do projeto <strong>Inglês com Propósito</strong>, cadastre aulas com vídeos do YouTube, apostilas em PDF e construtor dinâmico de exercícios.
            </p>
          </div>
          <button onClick={() => setShowAddTrackModal(true)} className="btn btn-primary">
            <Plus size={18} /> Nova Trilha
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('tracks')}
          className={`btn btn-sm ${activeTab === 'tracks' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={16} /> Gestão de Trilhas & Aulas (CRUD)
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`btn btn-sm ${activeTab === 'exercises' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Plus size={16} /> Construtor de Exercícios
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`btn btn-sm ${activeTab === 'gallery' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ImageIcon size={16} /> Gestão de Galeria de Fotos
        </button>
      </div>

      {activeTab === 'tracks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {tracks.map((track) => (
            <div key={track.id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span className="tag tag-blue">Nível: {track.level}</span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{track.title}</h3>
                </div>
              </div>

              {track.modules.map((mod) => (
                <div 
                  key={mod.id} 
                  style={{ 
                    background: 'var(--bg-secondary)', 
                    padding: '16px', 
                    borderRadius: 'var(--radius-md)', 
                    marginBottom: '14px',
                    border: '1px solid var(--border-color)' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{mod.title}</h4>
                    <button
                      onClick={() => {
                        setSelectedModuleId(mod.id);
                        setShowAddLessonModal(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Plus size={14} /> Adicionar Aula neste Módulo
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Video size={16} color="var(--accent-primary)" />
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{lesson.title}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              YouTube ID: <code>{lesson.youtube_id}</code> | PDF: {lesson.pdf_url ? 'Sim' : 'Não'} | {lesson.exercises?.length || 0} Exercícios
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleDeleteLesson(lesson.id)} className="btn btn-secondary btn-sm" style={{ padding: '6px', color: '#ef4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Cadastrar Novo Exercício Dinâmico</h3>

          <form onSubmit={handleCreateExercise} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '650px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Selecionar Aula Pertencente</label>
              <select
                className="input-field"
                value={targetLessonForEx}
                onChange={(e) => setTargetLessonForEx(e.target.value)}
                required
                style={{ marginTop: '4px' }}
              >
                <option value="">-- Escolha uma Aula --</option>
                {allLessons.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Tipo de Exercício</label>
              <select
                className="input-field"
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                style={{ marginTop: '4px' }}
              >
                <option value="multiple_choice">Múltipla Escolha</option>
                <option value="fill_in_blank">Preenchimento de Lacuna</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Pergunta / Enunciado</label>
              <input
                type="text"
                placeholder="Ex: Qual a tradução correta para 'Good Morning'?"
                className="input-field"
                value={exerciseQuestion}
                onChange={(e) => setExerciseQuestion(e.target.value)}
                required
                style={{ marginTop: '4px' }}
              />
            </div>

            {exerciseType === 'multiple_choice' && (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Alternativas de Opção</label>
                {exerciseOptions.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Opção ${i + 1}`}
                    className="input-field"
                    value={opt}
                    onChange={(e) => {
                      const copy = [...exerciseOptions];
                      copy[i] = e.target.value;
                      setExerciseOptions(copy);
                    }}
                    style={{ marginTop: '6px' }}
                  />
                ))}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Resposta Correta</label>
              <input
                type="text"
                placeholder="Digite exatamente a resposta esperada"
                className="input-field"
                value={exerciseCorrectAnswer}
                onChange={(e) => setExerciseCorrectAnswer(e.target.value)}
                required
                style={{ marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Explicação Didática (Feedback em caso de erro)</label>
              <textarea
                placeholder="Explicação gramatical ou de contexto..."
                className="input-field"
                rows={2}
                value={exerciseExplanation}
                onChange={(e) => setExerciseExplanation(e.target.value)}
                style={{ marginTop: '4px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Save size={16} /> Salvar Exercício
            </button>
          </form>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Adicionar Foto da Visita / Evento</h3>

          <form onSubmit={handleAddPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '650px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Título da Foto</label>
              <input
                type="text"
                placeholder="Ex: Visita dos Mentores de Nova York"
                className="input-field"
                value={newPhotoTitle}
                onChange={(e) => setNewPhotoTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Categoria</label>
              <select
                className="input-field"
                value={newPhotoCategory}
                onChange={(e) => setNewPhotoCategory(e.target.value)}
              >
                <option value="Visita Americana">Visita Americana</option>
                <option value="Evento">Evento</option>
                <option value="Aula Especial">Aula Especial</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>URL da Imagem (WebP / Unsplash)</label>
              <input
                type="url"
                placeholder="https://..."
                className="input-field"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Descrição</label>
              <textarea
                placeholder="Descrição dos alunos e voluntários participantes..."
                className="input-field"
                rows={2}
                value={newPhotoDesc}
                onChange={(e) => setNewPhotoDesc(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Cadastrar Foto
            </button>
          </form>
        </div>
      )}

      {showAddTrackModal && (
        <div className="modal-overlay" onClick={() => setShowAddTrackModal(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Criar Nova Trilha de Ensino</h3>
              <button onClick={() => setShowAddTrackModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTrack} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Título da Trilha (ex: Inglês para Carreiras)"
                className="input-field"
                value={newTrackTitle}
                onChange={(e) => setNewTrackTitle(e.target.value)}
                required
              />
              <select className="input-field" value={newTrackLevel} onChange={(e) => setNewTrackLevel(e.target.value)}>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
              <textarea
                placeholder="Descrição resumida da trilha..."
                className="input-field"
                rows={3}
                value={newTrackDesc}
                onChange={(e) => setNewTrackDesc(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Criar Trilha</button>
            </form>
          </div>
        </div>
      )}

      {showAddLessonModal && (
        <div className="modal-overlay" onClick={() => setShowAddLessonModal(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Adicionar Nova Aula</h3>
              <button onClick={() => setShowAddLessonModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateLesson} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Título da Aula"
                className="input-field"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="ID ou Link do Vídeo YouTube (ex: dQw4w9WgXcQ)"
                className="input-field"
                value={newLessonYoutubeId}
                onChange={(e) => setNewLessonYoutubeId(e.target.value)}
                required
              />
              <input
                type="url"
                placeholder="URL da Apostila em PDF (Supabase Storage)"
                className="input-field"
                value={newLessonPdfUrl}
                onChange={(e) => setNewLessonPdfUrl(e.target.value)}
              />
              <textarea
                placeholder="Descrição dos objetivos da aula..."
                className="input-field"
                rows={2}
                value={newLessonDesc}
                onChange={(e) => setNewLessonDesc(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Cadastrar Aula</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
