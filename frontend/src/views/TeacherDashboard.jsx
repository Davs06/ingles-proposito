import React, { useState } from 'react';
import { 
  Plus, Trash2, Video, Layers, Save, X, Image as ImageIcon, 
  LayoutGrid, Users, Settings, BookOpen, FileCheck, ArrowRight, 
  Sparkles, CheckCircle2, ChevronRight, BarChart3, ShieldCheck, Download,
  Upload, FileImage, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadImageToSupabase, uploadFileToSupabase, supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { INITIAL_MATERIALS } from './StudyMaterials';

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

  // Form states for Photo creation & Direct Supabase Storage Upload (Batch / Multiple Files)
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Visita Americana');
  const [uploadSource, setUploadSource] = useState('file'); // 'file' | 'url'
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [selectedPhotoFiles, setSelectedPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Form states for PDF Booklet & Materials Upload
  const [materialsList, setMaterialsList] = useState(INITIAL_MATERIALS);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatDesc, setNewMatDesc] = useState('');
  const [newMatCategory, setNewMatCategory] = useState('Apostila');
  const [selectedMatFile, setSelectedMatFile] = useState(null);
  const [isUploadingMat, setIsUploadingMat] = useState(false);

  // Load materials from Supabase DB on startup
  React.useEffect(() => {
    async function loadMat() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) setMaterialsList(data);
      } catch (err) {
        console.warn('Erro ao carregar materiais no painel docente:', err);
      }
    }
    loadMat();
  }, []);


  // Mock Students data for Environment 4 (Gestão de Alunos)
  const [students, setStudents] = useState([
    { id: 's1', name: 'Ana Clara Silva', email: 'ana.silva@email.com', progress: 85, speakingScore: 92, status: 'Ativo' },
    { id: 's2', name: 'Lucas Gabriel Santos', email: 'lucas.santos@email.com', progress: 60, speakingScore: 78, status: 'Ativo' },
    { id: 's3', name: 'Mariana Oliveira', email: 'mariana.o@email.com', progress: 100, speakingScore: 95, status: 'Concluído' },
    { id: 's4', name: 'Matheus Pereira', email: 'matheus.p@email.com', progress: 40, speakingScore: 70, status: 'Ativo' },
    { id: 's5', name: 'Beatriz Lima', email: 'beatriz.l@email.com', progress: 15, speakingScore: 65, status: 'Em Risco' }
  ]);

  const allLessons = tracks.flatMap((t) => t.modules.flatMap((m) => m.lessons));

  // Handlers for Batch Photo Upload
  const handlePhotoFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    const previews = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`O arquivo "${file.name}" não é uma imagem válida.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`O arquivo "${file.name}" excede 10 MB.`);
        continue;
      }
      validFiles.push(file);
      previews.push({
        file,
        url: URL.createObjectURL(file)
      });
    }

    setSelectedPhotoFiles((prev) => [...prev, ...validFiles]);
    setPhotoPreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();

    if (uploadSource === 'url') {
      if (!newPhotoTitle || !newPhotoUrl) {
        toast.error('Por favor, digite o título e a URL da imagem.');
        return;
      }

      const photoPayload = {
        title: newPhotoTitle,
        description: newPhotoDesc,
        image_url: newPhotoUrl,
        category: newPhotoCategory,
        event_date: new Date().toISOString().split('T')[0]
      };

      let newPhoto = { id: 'f' + Date.now().toString().slice(-11), ...photoPayload };

      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase.from('gallery_photos').insert([photoPayload]).select().single();
          if (data) newPhoto = data;
        } catch (err) {
          console.warn('Erro ao salvar no banco Supabase:', err);
        }
      }

      setGalleryItems([newPhoto, ...galleryItems]);
      setNewPhotoTitle('');
      setNewPhotoDesc('');
      setNewPhotoUrl('');
      toast.success('Foto enviada com sucesso!');
      return;
    }

    // Upload Source: Batch File Upload
    if (selectedPhotoFiles.length === 0) {
      toast.error('Por favor, selecione ao menos uma imagem do seu dispositivo.');
      return;
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading(`Enviando ${selectedPhotoFiles.length} foto(s) para o acervo...`);

    const newPhotos = [];

    for (let i = 0; i < selectedPhotoFiles.length; i++) {
      const file = selectedPhotoFiles[i];
      let imageUrl = '';

      try {
        imageUrl = await uploadImageToSupabase(file, 'gallery-photos');
      } catch (err) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      const fileTitle = selectedPhotoFiles.length === 1
        ? (newPhotoTitle || file.name.split('.')[0])
        : `${newPhotoTitle || 'Foto Intercâmbio'} (${i + 1})`;

      const photoPayload = {
        title: fileTitle,
        description: newPhotoDesc,
        image_url: imageUrl,
        category: newPhotoCategory,
        event_date: new Date().toISOString().split('T')[0]
      };

      let photoObj = { id: 'f' + (Date.now() + i).toString().slice(-11), ...photoPayload };

      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase.from('gallery_photos').insert([photoPayload]).select().single();
          if (data) photoObj = data;
        } catch (dbErr) {
          console.warn('Aviso ao salvar foto no banco:', dbErr);
        }
      }

      newPhotos.push(photoObj);
    }

    setGalleryItems([...newPhotos, ...galleryItems]);
    setSelectedPhotoFiles([]);
    setPhotoPreviews([]);
    setNewPhotoTitle('');
    setNewPhotoDesc('');
    setIsUploadingPhoto(false);
    toast.dismiss(toastId);
    toast.success(`${newPhotos.length} foto(s) enviada(s) para a galeria com sucesso!`);
  };

  const handleDeletePhoto = async (photoId) => {

    if (!confirm('Deseja remover esta foto da galeria?')) return;

    if (isSupabaseConfigured() && typeof photoId === 'string' && photoId.includes('-')) {
      try {
        await supabase.from('gallery_photos').delete().eq('id', photoId);
      } catch (err) {
        console.warn('Erro ao excluir foto do Supabase:', err);
      }
    }

    setGalleryItems(galleryItems.filter((p) => p.id !== photoId));
  };

  const handleDeleteTrack = async (trackId) => {
    if (!confirm('Tem certeza que deseja excluir esta trilha? Módulos e aulas associados também serão removidos.')) return;

    if (isSupabaseConfigured() && typeof trackId === 'string' && trackId.includes('-')) {
      try {
        const { error } = await supabase.from('tracks').delete().eq('id', trackId);
        if (error) console.warn('Erro ao excluir trilha do Supabase:', error.message);
      } catch (err) {
        console.warn('Erro ao excluir trilha do Supabase:', err);
      }
    }

    setTracks(tracks.filter((t) => t.id !== trackId));
    toast.success('Trilha excluída com sucesso!');
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Deseja excluir esta aula?')) return;

    if (isSupabaseConfigured() && typeof lessonId === 'string' && lessonId.includes('-')) {
      try {
        await supabase.from('lessons').delete().eq('id', lessonId);
      } catch (err) {
        console.warn('Erro ao excluir aula do Supabase:', err);
      }
    }

    setTracks(tracks.map(t => ({
      ...t,
      modules: t.modules.map(m => ({
        ...m,
        lessons: m.lessons.filter(l => l.id !== lessonId)
      }))
    })));
    toast.success('Aula excluída com sucesso!');
  };


  const handleCreateTrack = async (e) => {
    e.preventDefault();
    if (!newTrackTitle) return;

    const trackPayload = {
      title: newTrackTitle,
      description: newTrackDesc,
      level: newTrackLevel,
      order_index: tracks.length + 1,
      icon_name: 'book-open',
      is_published: true
    };

    let newTrack = {
      id: 't_' + Date.now(),
      ...trackPayload,
      modules: []
    };

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('tracks').insert([trackPayload]).select().single();
        if (data) {
          newTrack = { ...data, modules: [] };
          const { data: defaultMod } = await supabase.from('modules').insert([{
            track_id: data.id,
            title: 'Módulo 1: Introdução & Fundamentos',
            description: 'Módulo inicial da trilha',
            order_index: 1
          }]).select().single();
          if (defaultMod) {
            newTrack.modules = [{ ...defaultMod, lessons: [] }];
          }
        }
      } catch (err) {
        console.warn('Erro ao salvar trilha no banco:', err);
      }
    } else {
      newTrack.modules = [{
        id: 'm_' + Date.now(),
        track_id: newTrack.id,
        title: 'Módulo 1: Introdução & Fundamentos',
        description: 'Módulo inicial da trilha',
        order_index: 1,
        lessons: []
      }];
    }

    setTracks([...tracks, newTrack]);
    setNewTrackTitle('');
    setNewTrackDesc('');
    setShowAddTrackModal(false);
    toast.success('Nova trilha criada com sucesso!');
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle || !selectedModuleId) return;

    const lessonPayload = {
      module_id: selectedModuleId,
      title: newLessonTitle,
      description: newLessonDesc,
      youtube_id: newLessonYoutubeId || 'dQw4w9WgXcQ',
      pdf_url: newLessonPdfUrl || null,
      duration_minutes: Number(newLessonDuration) || 10,
      order_index: 99
    };

    let newLesson = {
      id: 'l_' + Date.now(),
      ...lessonPayload,
      exercises: []
    };

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('lessons').insert([lessonPayload]).select().single();
        if (data) {
          newLesson = { ...data, exercises: [] };
        }
      } catch (err) {
        console.warn('Erro ao salvar aula no banco:', err);
      }
    }

    setTracks(tracks.map(t => ({
      ...t,
      modules: t.modules.map(m => {
        if (m.id === selectedModuleId) {
          return { ...m, lessons: [...m.lessons, newLesson] };
        }
        return m;
      })
    })));

    setNewLessonTitle('');
    setNewLessonDesc('');
    setNewLessonYoutubeId('');
    setNewLessonPdfUrl('');
    setShowAddLessonModal(false);
    toast.success('Nova aula adicionada com sucesso!');
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    if (!exerciseQuestion || !targetLessonForEx) return;

    const exPayload = {
      lesson_id: targetLessonForEx,
      type: exerciseType,
      question: exerciseQuestion,
      options: exerciseType === 'multiple_choice' ? exerciseOptions.filter(Boolean) : [],
      correct_answer: exerciseCorrectAnswer,
      explanation: exerciseExplanation,
      order_index: 99
    };

    let newEx = {
      id: 'e_' + Date.now(),
      ...exPayload
    };

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('exercises').insert([exPayload]).select().single();
        if (data) {
          newEx = data;
        }
      } catch (err) {
        console.warn('Erro ao salvar exercício no banco:', err);
      }
    }

    setTracks(tracks.map(t => ({
      ...t,
      modules: t.modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id === targetLessonForEx) {
            return { ...l, exercises: [...(l.exercises || []), newEx] };
          }
          return l;
        })
      }))
    })));

    setExerciseQuestion('');
    setExerciseCorrectAnswer('');
    setExerciseExplanation('');
    toast.success('Novo exercício adicionado com sucesso!');
  };

  const handleAddMaterial = async (e) => {

    e.preventDefault();
    if (!newMatTitle || !selectedMatFile) {
      toast.error('Por favor, informe o título e selecione um arquivo (PDF ou Imagem).');
      return;
    }

    setIsUploadingMat(true);
    try {
      const fileUrl = await uploadFileToSupabase(selectedMatFile, 'lessons-pdf');
      const isPdf = selectedMatFile.type === 'application/pdf' || selectedMatFile.name.endsWith('.pdf');

      const matPayload = {
        title: newMatTitle,
        description: newMatDesc,
        file_url: fileUrl,
        file_type: isPdf ? 'pdf' : 'image',
        category: newMatCategory
      };

      let newMat = {
        id: 'm_' + Date.now(),
        ...matPayload
      };

      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase.from('materials').insert([matPayload]).select().single();
          if (data) newMat = data;
        } catch (dbErr) {
          console.warn('Erro ao salvar material no banco:', dbErr);
        }

      }

      setMaterialsList([newMat, ...materialsList]);
      setNewMatTitle('');
      setNewMatDesc('');
      setSelectedMatFile(null);
      toast.success('Apostila/Material enviado com sucesso!');
    } catch (err) {
      console.error('Erro no upload de material:', err);
      toast.error(err.message || 'Ocorreu um erro ao enviar o arquivo.');
    } finally {

      setIsUploadingMat(false);
    }
  };

  const handleDeleteMaterial = async (matId) => {
    if (!confirm('Deseja excluir esta apostila/material?')) return;

    if (isSupabaseConfigured() && typeof matId === 'string' && matId.includes('-')) {
      try {
        await supabase.from('materials').delete().eq('id', matId);
      } catch (err) {
        console.warn('Erro ao excluir material do Supabase:', err);
      }
    }

    setMaterialsList(materialsList.filter((m) => m.id !== matId));
    toast.success('Material excluído com sucesso!');
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
      id: 'materials',
      name: 'Ambiente de Apostilas & Materiais PDF',
      tag: 'Documentos & Apostilas',
      tagColor: 'tag-cyan',
      icon: BookOpen,
      color: '#06b6d4',
      description: 'Upload de apostilas em PDF e guias de estudo no bucket lessons-pdf do Supabase.',
      count: `${materialsList.length} Apostilas Cadastradas`
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
          onClick={() => setActiveTab('materials')}
          className={`btn btn-sm ${activeTab === 'materials' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookOpen size={15} /> Amb. Apostilas ({materialsList.length})
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
                <button
                  onClick={() => handleDeleteTrack(track.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '6px 12px', fontSize: '0.78rem' }}
                  title="Excluir Trilha"
                >
                  <Trash2 size={14} /> Excluir Trilha
                </button>
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
          AMBIENTE APOSTILAS: GESTÃO DE APOSTILAS & MATERIAIS PDF
          ======================================================== */}
      {activeTab === 'materials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Cadastrar Nova Apostila / Material em PDF</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px' }}>
              Envie apostilas em PDF ou imagens educativas diretamente para o bucket <code>lessons-pdf</code> do Supabase Storage.
            </p>

            <form onSubmit={handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '650px' }}>
              <input
                type="text"
                placeholder="Título do Material (ex: Apostila Módulo 1 - Conversação)"
                className="input-field"
                value={newMatTitle}
                onChange={(e) => setNewMatTitle(e.target.value)}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Categoria</label>
                  <select className="input-field" value={newMatCategory} onChange={(e) => setNewMatCategory(e.target.value)}>
                    <option value="Apostila">Apostila</option>
                    <option value="Guia Gramatical">Guia Gramatical</option>
                    <option value="Vocabulário">Vocabulário</option>
                    <option value="Exercício Extra">Exercício Extra</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Arquivo (PDF ou Imagem)</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setSelectedMatFile(e.target.files?.[0])}
                    className="input-field"
                    style={{ paddingTop: '6px' }}
                    required
                  />
                </div>
              </div>

              <textarea
                placeholder="Descrição detalhada do conteúdo do material..."
                className="input-field"
                rows={3}
                value={newMatDesc}
                onChange={(e) => setNewMatDesc(e.target.value)}
              />

              <button type="submit" disabled={isUploadingMat} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <Upload size={16} /> {isUploadingMat ? 'Enviando para Supabase Storage...' : 'Enviar Apostila para o Acervo'}
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '14px' }}>Apostilas e Materiais no Acervo ({materialsList.length})</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {materialsList.map((item) => (
                <div key={item.id} style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="tag tag-cyan" style={{ fontSize: '0.68rem' }}>{item.category}</span>
                      <button onClick={() => handleDeleteMaterial(item.id)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: '#ef4444' }} title="Excluir Material">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>{item.title}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description}</p>
                  </div>
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}>
                    <Download size={13} /> Abrir Material
                  </a>
                </div>
              ))}
            </div>
          </div>
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

              {/* Upload Source: File Picker (Batch / Multiple Support) */}
              {uploadSource === 'file' ? (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Selecione uma ou mais Imagens (PNG, JPG, WebP — Max 10MB cada)
                  </label>
                  <div
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoFileSelect}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%',
                        zIndex: 2
                      }}
                    />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <Upload size={32} color="var(--accent-primary)" />
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        Clique ou arraste várias imagens para envio em lote (Batch Upload)
                      </strong>
                      <span style={{ fontSize: '0.75rem' }}>Suporta múltiplos arquivos simultâneos gravados no Supabase Storage S3</span>
                    </div>
                  </div>

                  {/* Selected Batch Thumbnails Queue */}
                  {photoPreviews.length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--accent-success)' }}>
                          ✓ {photoPreviews.length} imagem(ns) selecionada(s) para envio:
                        </span>
                        <button
                          type="button"
                          onClick={() => { setSelectedPhotoFiles([]); setPhotoPreviews([]); }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#ef4444' }}
                        >
                          Limpar Lista
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '8px' }}>
                        {photoPreviews.map((prev, idx) => (
                          <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img src={prev.url} alt={prev.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleRemoveSelectedFile(idx); }}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'rgba(0,0,0,0.75)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10
                              }}
                              title="Remover imagem"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                disabled={isUploadingPhoto || (uploadSource === 'file' && selectedPhotoFiles.length === 0)}
                style={{ alignSelf: 'flex-start', minWidth: '220px' }}
              >
                {isUploadingPhoto ? (
                  <>Enviando Lote para o Supabase...</>
                ) : uploadSource === 'file' && selectedPhotoFiles.length > 1 ? (
                  <><Upload size={15} /> Enviar {selectedPhotoFiles.length} Fotos em Lote</>
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
              <button className="btn btn-secondary btn-sm" onClick={() => toast.success('Relatório exportado em CSV com sucesso!')}>
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
