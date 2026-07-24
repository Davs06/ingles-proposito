import React from 'react';
import { BookOpen, Play, CheckCircle, Award, ChevronRight, Mic, ArrowRight } from 'lucide-react';

export default function StudentDashboard({ tracks, progress, onSelectLesson, onOpenSpeaking }) {
  const totalLessons = tracks.reduce((sum, t) => 
    sum + t.modules.reduce((mSum, m) => mSum + m.lessons.length, 0), 0
  );
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          padding: '28px', 
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(139,92,246,0.1) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <div className="tag tag-blue" style={{ marginBottom: '8px' }}>
              <Award size={12} /> PIB São Miguel Paulista • 100% Gratuito
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Inglês com Propósito</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '550px' }}>
              Desenvolva sua fluência em inglês com videoaulas, materiais em PDF e laboratório de speaking impulsionado por Inteligência Artificial.
            </p>
          </div>

          <div 
            style={{ 
              background: 'var(--bg-card)', 
              padding: '16px 20px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)',
              minWidth: '220px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              <span>Progresso Total</span>
              <strong style={{ color: 'var(--accent-primary)' }}>{progressPercentage}%</strong>
            </div>
            <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              {completedCount} de {totalLessons} aulas concluídas
            </div>
          </div>
        </div>
      </div>

      <div 
        onClick={onOpenSpeaking}
        className="glass-panel glass-panel-hover" 
        style={{ 
          padding: '20px 24px', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)',
          borderColor: 'rgba(139,92,246,0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Mic size={22} />
          </div>
          <div>
            <div className="tag tag-purple" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>Tecnologia IA Gemini</div>
            <h3 style={{ fontSize: '1.1rem' }}>Laboratório de Speaking com Reconhecimento de Voz</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Treine sua pronúncia em tempo real com feedback fonético inteligente e conversação nativa.
            </p>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" style={{ background: 'var(--accent-purple)', borderColor: 'transparent' }}>
          Praticar Agora <ArrowRight size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={20} color="var(--accent-primary)" /> Trilhas de Ensino Disponíveis
        </h3>

        {tracks.map((track) => (
          <div key={track.id} className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="tag tag-blue" style={{ marginBottom: '6px' }}>Nível: {track.level}</span>
                <h4 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{track.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>{track.description}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {track.modules.map((module) => (
                <div 
                  key={module.id} 
                  style={{ 
                    background: 'var(--bg-secondary)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '16px 20px', 
                    border: '1px solid var(--border-color)' 
                  }}
                >
                  <h5 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    {module.title}
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                    {module.lessons.map((lesson) => {
                      const isCompleted = !!progress[lesson.id];
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson, track, module)}
                          className="glass-panel glass-panel-hover"
                          style={{
                            padding: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
                            borderColor: isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'
                          }}
                        >
                          <div 
                            style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              background: isCompleted ? 'var(--accent-success-bg)' : 'var(--accent-light)',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: isCompleted ? 'var(--accent-success)' : 'var(--accent-primary)',
                              flexShrink: 0
                            }}
                          >
                            {isCompleted ? <CheckCircle size={18} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {lesson.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {lesson.duration_minutes} min • {lesson.exercises?.length || 0} exercícios
                            </div>
                          </div>

                          <ChevronRight size={16} color="var(--text-muted)" />
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
