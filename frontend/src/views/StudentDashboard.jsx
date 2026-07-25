import React from 'react';
import { BookOpen, Play, CheckCircle, Award, ChevronRight, Mic, ArrowRight } from 'lucide-react';

export default function StudentDashboard({ tracks, progress, onSelectLesson, onOpenSpeaking }) {
  const totalLessons = tracks.reduce((sum, t) => 
    sum + t.modules.reduce((mSum, m) => mSum + m.lessons.length, 0), 0
  );
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px', 
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(139,92,246,0.1) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <div className="tag tag-blue" style={{ marginBottom: '6px' }}>
              <Award size={12} /> PIB São Miguel Paulista • 100% Gratuito
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Propósito do Inglês</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '550px', lineHeight: '1.4' }}>
              Desenvolva sua fluência em inglês com videoaulas, materiais em PDF e laboratório de speaking impulsionado por Inteligência Artificial.
            </p>
          </div>

          <div 
            style={{ 
              background: 'var(--bg-card)', 
              padding: '14px 18px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)',
              width: '100%',
              maxWidth: '280px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              <span>Progresso Total</span>
              <strong style={{ color: 'var(--accent-primary)' }}>{progressPercentage}%</strong>
            </div>
            <div style={{ height: '7px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${progressPercentage}%`, 
                  background: 'linear-gradient(90deg, #2563eb, #10b981)',
                  borderRadius: '99px',
                  transition: 'width 0.5s ease'
                }} 
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {completedCount} de {totalLessons} aulas concluídas
            </div>
          </div>
        </div>
      </div>

      {/* Speaking Lab Promo Banner */}
      <div 
        onClick={onOpenSpeaking}
        className="glass-panel glass-panel-hover" 
        style={{ 
          padding: '16px 20px', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'linear-gradient(90deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)',
          borderColor: 'rgba(139,92,246,0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <Mic size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="tag tag-purple" style={{ fontSize: '0.62rem', marginBottom: '2px' }}>IA Gemini</div>
            <h3 style={{ fontSize: '1.05rem', lineHeight: '1.2' }}>Laboratório de Speaking IA</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              Treine sua pronúncia em tempo real com feedback fonético inteligente.
            </p>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" style={{ background: 'var(--accent-purple)', borderColor: 'transparent', alignSelf: 'center' }}>
          Praticar <ArrowRight size={15} />
        </button>
      </div>

      {/* Tracks Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} color="var(--accent-primary)" /> Trilhas de Ensino Disponíveis
        </h3>

        {tracks.map((track) => (
          <div key={track.id} className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ marginBottom: '14px' }}>
              <span className="tag tag-blue" style={{ marginBottom: '4px' }}>Nível: {track.level}</span>
              <h4 style={{ fontSize: '1.15rem', marginTop: '4px' }}>{track.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>{track.description}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {track.modules.map((module) => (
                <div 
                  key={module.id} 
                  style={{ 
                    background: 'var(--bg-secondary)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '14px', 
                    border: '1px solid var(--border-color)' 
                  }}
                >
                  <h5 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
                    {module.title}
                  </h5>

                  <div className="grid-responsive">
                    {module.lessons.map((lesson) => {
                      const isCompleted = !!progress[lesson.id];
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson, track, module)}
                          className="glass-panel glass-panel-hover"
                          style={{
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
                            borderColor: isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)',
                            minWidth: 0
                          }}
                        >
                          <div 
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              background: isCompleted ? 'var(--accent-success-bg)' : 'var(--accent-light)',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: isCompleted ? 'var(--accent-success)' : 'var(--accent-primary)',
                              flexShrink: 0
                            }}
                          >
                            {isCompleted ? <CheckCircle size={16} /> : <Play size={14} style={{ marginLeft: '1px' }} />}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {lesson.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {lesson.duration_minutes} min • {lesson.exercises?.length || 0} ex.
                            </div>
                          </div>

                          <ChevronRight size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

