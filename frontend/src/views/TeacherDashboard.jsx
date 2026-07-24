import React, { useState } from 'react';
import { 
  Plus, Trash2, Video, Layers, Save, X, Image as ImageIcon, 
  LayoutGrid, Users, Settings, BookOpen, FileCheck, ArrowRight, 
  Sparkles, CheckCircle2, ChevronRight, BarChart3, ShieldCheck, Download,
  Upload, FileImage, Loader2
} from 'lucide-react';
import { uploadImageToSupabase } from '../services/supabaseClient';

export default function TeacherDashboard({ 
  tracks, 
  setTracks, 
  galleryItems, 
  setGalleryItems,
  activeTab = 'environments',
  setActiveTab
}) {
  // Modal states
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // Form states for Track creation
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');
  const [newTrackLevel, setNewTrackLevel] = useState('Iniciante');

  // Form states for Lesson creation
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonYoutubeId, setNewLessonYoutubeId] = useState('');
  const [newLessonPdfUrl, setNewLessonPdfUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(10);

  // Form states for Exercise creation
  const [exerciseQuestion, setExerciseQuestion] = useState('');
  const [exerciseType, setExerciseType] = useState('multiple_choice');
  const [exerciseOptions, setExerciseOptions] = useState(['', '', '', '']);
  const [exerciseCorrectAnswer, setExerciseCorrectAnswer] = useState('');
  const [exerciseExplanation, setExerciseExplanation] = useState('');
  const [targetLessonForEx, setTargetLessonForEx] = useState('');

  // Form states for Photo creation & Direct Supabase Storage Upload
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Visita Americana');
  const [uploadSource, setUploadSource] = useState('file'); // 'file' | 'url'
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Mock Students data for Environment 4 (Gestão de Alunos)
  const [students, setStudents] = useState([
    { id: 's1', name: 'Ana Clara Silva', email: 'ana.silva@email.com', progress: 85, speakingScore: 92, status: 'Ativo' },
    { id: 's2', name: 'Lucas Gabriel Santos', email: 'lucas.santos@email.com', progress: 60, speakingScore: 78, status: 'Ativo' },
    { id: 's3', name: 'Mariana Oliveira', email: 'mariana.o@email.com', progress: 100, speakingScore: 95, status: 'Concluído' },
    { id: 's4', name: 'Matheus Pereira', email: 'matheus.p@email.com', progress: 40, speakingScore: 70, status: 'Ativo' },
    { id: 's5', name: 'Beatriz Lima', email: 'beatriz.l@email.com', progress: 15, speakingScore: 65, status: 'Em Risco' }
  ]);

  const allLessons = tracks.flatMap((t) => t.modules.flatMap((m) => m.lessons));

  // Handlers
  const handlePhotoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('O tamanho da imagem não deve exceder 10 MB.');
      return;
    }

    setSelectedPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoTitle) return;

    let finalImageUrl = newPhotoUrl;

    if (uploadSource === 'file') {
      if (!selectedPhotoFile) {
        alert('Por favor, selecione um arquivo de imagem do seu dispositivo.');
        return;
      }
      setIsUploadingPhoto(true);
      try {
        finalImageUrl = await uploadImageToSupabase(selectedPhotoFile, 'gallery-photos');
      } catch (err) {
        console.error('Erro no upload para Supabase Storage:', err);
        alert('Ocorreu um erro ao enviar a imagem para o Supabase Storage. Verifique sua conexão.');
        setIsUploadingPhoto(false);
        return;
      } finally {
        setIsUploadingPhoto(false);
      }
    } else {
      if (!newPhotoUrl) {
        alert('Por favor, digite a URL da imagem.');
        return;
      }
    }

    const newPhoto = {
      id: 'f' + Date.now().toString().slice(-11),
      title: newPhotoTitle,
      description: newPhotoDesc,
      image_url: finalImageUrl,
      category: newPhotoCategory,
      event_date: new Date().toISOString().split('T')[0]
    };

    setGalleryItems([newPhoto, ...galleryItems]);
    setNewPhotoTitle('');
    setNewPhotoDesc('');
    setNewPhotoUrl('');
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    alert('Foto enviada e adicionada com sucesso!');
  };


  const handleDeletePhoto = (photoId) => {
    if (!confirm('Deseja remover esta foto da galeria?')) return;
    setGalleryItems(galleryItems.filter((p) => p.id !== photoId));
  };

  // Environment Config Data
  const environmentsList = [
    {
      id: 'tracks',
      name: 'Ambiente de Trilhas & Videoaulas',
      tag: 'Conteúdo Acadêmico',
      tagColor: 'tag-blue',
      icon: Layers,
      color: '#3b82f6',
      description: 'Gestão de cursos, módulos, videoaulas do YouTube e apostilas em PDF.',
      count: `${tracks.length} Trilhas | ${allLessons.length} Aulas`
    },
    {
      id: 'exercises',
      name: 'Ambiente de Exercícios & Questões',
      tag: 'Avaliação & Homework',
      tagColor: 'tag-purple',
      icon: FileCheck,
      color: '#8b5cf6',
      description: 'Construtor dinâmico de homework, questões objetivas e lacunas.',
      count: `${allLessons.reduce((sum, l) => sum + (l.exercises?.length || 0), 0)} Exercícios`
    },
    {
      id: 'gallery',
      name: 'Ambiente de Galeria & Vivências',
      tag: 'Intercâmbio & Mídia',
      tagColor: 'tag-green',
      icon: ImageIcon,
      color: '#10b981',
      description: 'Fotos de visitas da delegação americana, workshops e eventos sociais.',
      count: `${galleryItems.length} Fotos Cadastradas`
    },
    {
      id: 'students',
      name: 'Ambiente de Alunos & Desempenho',
      tag: 'Métricas de Turma',
      tagColor: 'tag-warning',
      icon: Users,
      color: '#f59e0b',
      description: 'Acompanhamento do progresso da turma, entregas e notas do Speaking IA.',
      count: `${students.length} Alunos Inscritos`
    },
    {
      id: 'settings',
      name: 'Ambiente de Configurações & Turmas',
      tag: 'Institucional PIB',
      tagColor: 'tag-cyan',
      icon: Settings,
      color: '#06b6d4',
      description: 'Definições do projeto PIB São Miguel Paulista, chave API e relatórios.',
      count: 'Ativo • Versão 2.0'
    }
  ];

  const currentEnvInfo = environmentsList.find((e) => e.id === activeTab) || environmentsList[0];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Dynamic Header Badge for Selected Environment */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px', 
          background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tag tag-blue">Painel Docente & Gestão de Ambientes</span>
              {activeTab !== 'environments' && (
                <span className={`tag ${currentEnvInfo.tagColor}`}>
                  {currentEnvInfo.name}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem' }}>Inglês com Propósito — PIB São Miguel</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px', maxWidth: '600px' }}>
              Navegue entre os ambientes de ensino para gerenciar conteúdos, atividades, intercâmbios e progresso dos estudantes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {activeTab !== 'environments' && (
              <button 
                onClick={() => setActiveTab('environments')} 
                className="btn btn-secondary btn-sm"
              >
                <LayoutGrid size={15} /> Ver Todos Ambientes
              </button>
            )}
            {activeTab === 'tracks' && (
              <button onClick={() => setShowAddTrackModal(true)} className="btn btn-primary btn-sm">
                <Plus size={15} /> Nova Trilha
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Environment Tabs Bar (Mobile-First) */}
      <div className="scroll-x-tabs" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('environments')}
          className={`btn btn-sm ${activeTab === 'environments' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <LayoutGrid size={15} /> Hub de Ambientes
        </button>
        <button
          onClick={() => setActiveTab('tracks')}
          className={`btn btn-sm ${activeTab === 'tracks' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={15} /> Amb. Trilhas ({tracks.length})
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`btn btn-sm ${activeTab === 'exercises' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileCheck size={15} /> Amb. Exercícios
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`btn btn-sm ${activeTab === 'gallery' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ImageIcon size={15} /> Amb. Galeria ({galleryItems.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={15} /> Amb. Alunos ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Settings size={15} /> Amb. Configurações
        </button>
      </div>

      {/* ========================================================
          HUB DE AMBIENTES OVERVIEW (GRID SELECTION)
          ======================================================== */}
      {activeTab === 'environments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Ambientes de Gestão do Sistema</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Clique no ambiente para gerenciar</span>
          </div>

          <div className="environment-grid">
            {environmentsList.map((env) => {
              const IconComponent = env.icon;
              return (
                <div
                  key={env.id}
                  onClick={() => setActiveTab(env.id)}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    gap: '16px',
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div 
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '12px', 
                          background: `${env.color}20`, 
                          color: env.color, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <IconComponent size={22} />
                      </div>
                      <span className={`tag ${env.tagColor}`}>{env.tag}</span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>{env.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: '1.4' }}>
                      {env.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                      {env.count}
                    </span>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', color: env.color }}>
                      Acessar <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          AMBIENTE 1: GESTÃO DE TRILHAS & AULAS
          ======================================================== */}
      {activeTab === 'tracks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Trilhas e Módulos Cadastrados</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crie e organize os módulos e videoaulas do curso</p>
            </div>
            <button onClick={() => setShowAddTrackModal(true)} className="btn btn-primary btn-sm">
              <Plus size={15} /> Criar Trilha
            </button>
          </div>

          {tracks.map((track) => (
            <div key={track.id} className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className="tag tag-blue">Nível: {track.level}</span>
                  <h4 style={{ fontSize: '1.15rem', marginTop: '4px' }}>{track.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{track.description}</p>
                </div>
              </div>

              {track.modules.map((mod) => (
                <div 
                  key={mod.id} 
                  style={{ 
                    background: 'var(--bg-secondary)', 
                    padding: '14px', 
                    borderRadius: 'var(--radius-md)', 
                    marginBottom: '12px',
                    border: '1px solid var(--border-color)' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <h5 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{mod.title}</h5>
                    <button
                      onClick={() => {
                        setSelectedModuleId(mod.id);
                        setShowAddLessonModal(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      <Plus size={13} /> Adicionar Aula
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mod.lessons.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px' }}>
                        Nenhuma aula cadastrada neste módulo.
                      </div>
                    ) : (
                      mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            gap: '10px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                            <Video size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {lesson.title}
                              </strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                YouTube: <code>{lesson.youtube_id}</code> • PDF: {lesson.pdf_url ? 'Sim' : 'Não'} • {lesson.exercises?.length || 0} Ex.
                              </div>
                            </div>
                          </div>

                          <button onClick={() => handleDeleteLesson(lesson.id)} className="btn btn-secondary btn-sm" style={{ padding: '6px', color: '#ef4444', flexShrink: 0 }} title="Excluir Aula">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          AMBIENTE 2: CONSTRUTOR DE EXERCÍCIOS
          ======================================================== */}
      {activeTab === 'exercises' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Cadastrar Novo Exercício Dinâmico</h3>

          <form onSubmit={handleCreateExercise} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '650px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Selecionar Aula Pertencente</label>
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
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Tipo de Exercício</label>
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
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Pergunta / Enunciado</label>
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
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Alternativas de Opção</label>
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
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Resposta Correta</label>
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
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Explicação Didática (Feedback)</label>
              <textarea
                placeholder="Explicação gramatical..."
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

      {/* ========================================================
          AMBIENTE 3: GESTÃO DE GALERIA DE FOTOS
          ======================================================== */}
      {activeTab === 'gallery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Cadastrar Nova Foto no Intercâmbio</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Envie fotos diretamente do seu dispositivo para o bucket do <strong>Supabase Storage S3</strong> (<code>gallery-photos</code>).
              </p>
            </div>

            <form onSubmit={handleAddPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '650px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Título da Foto</label>
                <input
                  type="text"
                  placeholder="Ex: Visita da Delegação de Boston em 2026"
                  className="input-field"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  required
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Categoria do Evento</label>
                <select
                  className="input-field"
                  value={newPhotoCategory}
                  onChange={(e) => setNewPhotoCategory(e.target.value)}
                  style={{ marginTop: '4px' }}
                >
                  <option value="Visita Americana">Visita Americana</option>
                  <option value="Evento">Evento</option>
                  <option value="Aula Especial">Aula Especial</option>
                </select>
              </div>

              {/* Source Toggle Pills */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Origem da Imagem
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setUploadSource('file')}
                    className={`btn btn-sm ${uploadSource === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <Upload size={14} /> Upload do Dispositivo (Supabase S3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadSource('url')}
                    className={`btn btn-sm ${uploadSource === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <FileImage size={14} /> Link de URL Externa
                  </button>
                </div>
              </div>

              {/* Upload Source: File Picker */}
              {uploadSource === 'file' ? (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Selecione a Imagem (PNG, JPG, WebP — Max 10MB)
                  </label>
                  <div
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      textAlign: 'center',
                      background: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileSelect}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    
                    {photoPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={photoPreview} 
                          alt="Pré-visualização" 
                          style={{ maxHeight: '180px', borderRadius: 'var(--radius-md)', objectFit: 'contain', border: '1px solid var(--border-color)' }} 
                        />
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-success)', fontWeight: '600' }}>
                          ✓ Arquivo selecionado: {selectedPhotoFile?.name} ({(selectedPhotoFile?.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Clique na área para escolher outra imagem</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <Upload size={32} color="var(--accent-primary)" />
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Clique ou arraste um arquivo de imagem aqui</strong>
                        <span style={{ fontSize: '0.75rem' }}>Será salvo diretamente no armazenamento do Supabase Storage</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>URL Direta da Imagem</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="input-field"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    required={uploadSource === 'url'}
                    style={{ marginTop: '4px' }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Descrição dos Alunos e Evento</label>
                <textarea
                  placeholder="Descrição resumida das atividades com os mentores..."
                  className="input-field"
                  rows={2}
                  value={newPhotoDesc}
                  onChange={(e) => setNewPhotoDesc(e.target.value)}
                  style={{ marginTop: '4px' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isUploadingPhoto || (uploadSource === 'file' && !selectedPhotoFile)}
                style={{ alignSelf: 'flex-start', minWidth: '180px' }}
              >
                {isUploadingPhoto ? (
                  <>Enviando para o Supabase...</>
                ) : (
                  <><Upload size={15} /> Cadastrar Foto na Galeria</>
                )}
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '14px' }}>Fotos no Acervo ({galleryItems.length})</h4>
            <div className="grid-responsive">
              {galleryItems.map((item) => (
                <div key={item.id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ padding: '12px' }}>
                    <span className="tag tag-green" style={{ fontSize: '0.65rem' }}>{item.category}</span>
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginTop: '4px', color: 'var(--text-primary)' }}>{item.title}</strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.event_date}</span>
                      <button onClick={() => handleDeletePhoto(item.id)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444', padding: '4px 8px' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          AMBIENTE 4: GESTÃO DE ALUNOS & DESEMPENHO
          ======================================================== */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Relatório da Turma — PIB São Miguel</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Métricas de progresso, speaking IA e conclusão de tarefas</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => alert('Relatório exportado em CSV!')}>
                <Download size={14} /> Exportar CSV
              </button>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total de Alunos</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{students.length}</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progresso Médio</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-success)' }}>60%</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Média Speaking IA</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-purple)' }}>78 pts</div>
              </div>
            </div>

            {/* Table of Students */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Aluno</th>
                    <th style={{ padding: '10px' }}>Progresso Trilhas</th>
                    <th style={{ padding: '10px' }}>Nota Speaking</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{st.name}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.email}</span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '80px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ width: `${st.progress}%`, height: '100%', background: 'var(--accent-primary)' }} />
                          </div>
                          <span>{st.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className="tag tag-purple" style={{ fontSize: '0.7rem' }}>{st.speakingScore} / 100</span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`tag ${st.status === 'Concluído' ? 'tag-green' : st.status === 'Em Risco' ? 'tag-warning' : 'tag-blue'}`} style={{ fontSize: '0.68rem' }}>
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          AMBIENTE 5: CONFIGURAÇÕES & INSTITUCIONAL
          ======================================================== */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Configurações do Projeto</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Unidade Responsável</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Primeira Igreja Batista em São Miguel Paulista — Projeto Inglês com Propósito
              </p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Serviço de Inteligência Artificial</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Google Gemini Free Tier (Model: <code>gemini-1.5-flash</code>) via Backend Node.js Express.
              </p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Armazenamento de Apostilas PDF</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Supabase Cloud Storage (Free Tier bucket <code>lessons-pdf</code>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Track Creation */}
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

      {/* Modal Lesson Creation */}
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
                placeholder="ID ou Link do Vídeo YouTube"
                className="input-field"
                value={newLessonYoutubeId}
                onChange={(e) => setNewLessonYoutubeId(e.target.value)}
                required
              />
              <input
                type="url"
                placeholder="URL da Apostila em PDF"
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
