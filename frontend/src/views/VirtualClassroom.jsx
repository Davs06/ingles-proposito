import React, { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle, Award, BookOpen, Sparkles } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import PdfViewerModal from '../components/PdfViewerModal';
import HomeworkModule from './HomeworkModule';

export default function VirtualClassroom({ lesson, track, module, onBack, onCompleteLesson, isCompleted }) {
  const [showPdf, setShowPdf] = useState(false);
  const [activeTab, setActiveTab] = useState('video');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Voltar para Trilhas
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lesson.pdf_url && (
            <button onClick={() => setShowPdf(true)} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-primary)' }}>
              <FileText size={16} /> Material PDF
            </button>
          )}

          <button
            onClick={() => onCompleteLesson(lesson.id)}
            className={`btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              borderColor: isCompleted ? 'var(--accent-success)' : undefined,
              color: isCompleted ? 'var(--accent-success)' : undefined
            }}
          >
            <CheckCircle size={16} /> {isCompleted ? 'Aula Concluída' : 'Marcar Concluída'}
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600', textTransform: 'uppercase' }}>
          {track?.title} • {module?.title}
        </div>
        <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>{lesson.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          {lesson.description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('video')}
          className={`btn btn-sm ${activeTab === 'video' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookOpen size={16} /> Player da Videoaula
        </button>
        <button
          onClick={() => setActiveTab('homework')}
          className={`btn btn-sm ${activeTab === 'homework' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Award size={16} /> Resolução de Homework ({lesson.exercises?.length || 0})
        </button>
      </div>

      {activeTab === 'video' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <VideoPlayer youtubeId={lesson.youtube_id} title={lesson.title} />

          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-glass)' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Assista à aula com atenção e, em seguida, responda às questões no painel de <strong>Homework</strong> para fixar o conteúdo!
            </div>
          </div>
        </div>
      ) : (
        <HomeworkModule exercises={lesson.exercises} onCompleteHomework={() => onCompleteLesson(lesson.id)} />
      )}

      <PdfViewerModal
        pdfUrl={lesson.pdf_url}
        title={`Apostila: ${lesson.title}`}
        isOpen={showPdf}
        onClose={() => setShowPdf(false)}
      />
    </div>
  );
}
