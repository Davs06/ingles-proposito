import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, Award } from 'lucide-react';

export default function HomeworkModule({ exercises, onCompleteHomework }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [inputText, setInputText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!exercises || exercises.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Nenhum exercício cadastrado para esta aula.
      </div>
    );
  }

  const currentEx = exercises[currentIndex];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitted) return;

    let correct = false;
    if (currentEx.type === 'multiple_choice') {
      correct = selectedOption.trim().toLowerCase() === currentEx.correct_answer.trim().toLowerCase();
    } else {
      correct = inputText.trim().toLowerCase() === currentEx.correct_answer.trim().toLowerCase();
    }

    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) setScoreCount((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption('');
      setInputText('');
      setSubmitted(false);
      setIsCorrect(false);
    } else {
      setFinished(true);
      if (onCompleteHomework) onCompleteHomework(scoreCount + (isCorrect ? 1 : 0));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption('');
    setInputText('');
    setSubmitted(false);
    setIsCorrect(false);
    setScoreCount(0);
    setFinished(false);
  };

  if (finished) {
    const finalPercent = Math.round(((scoreCount) / exercises.length) * 100);
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-success)', margin: '0 auto 16px auto' }}>
          <Award size={32} />
        </div>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Homework Concluído!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
          Você acertou <strong>{scoreCount} de {exercises.length}</strong> exercícios ({finalPercent}% de aproveitamento).
        </p>
        <button onClick={handleRestart} className="btn btn-secondary btn-sm" style={{ margin: '0 auto' }}>
          <RefreshCw size={16} /> Refazer Exercícios
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="tag tag-blue">
          Exercício {currentIndex + 1} de {exercises.length}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {currentEx.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Preenchimento de Lacuna'}
        </span>
      </div>

      <h4 style={{ fontSize: '1.1rem', lineHeight: '1.4', marginBottom: '20px' }}>
        {currentEx.question}
      </h4>

      <form onSubmit={handleSubmit}>
        {currentEx.type === 'multiple_choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {currentEx.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              let border = 'var(--border-color)';
              let bg = 'var(--bg-secondary)';

              if (submitted) {
                if (opt.toLowerCase() === currentEx.correct_answer.toLowerCase()) {
                  border = 'var(--accent-success)';
                  bg = 'var(--accent-success-bg)';
                } else if (isSelected && !isCorrect) {
                  border = '#ef4444';
                  bg = 'rgba(239, 68, 68, 0.12)';
                }
              } else if (isSelected) {
                border = 'var(--accent-primary)';
                bg = 'var(--accent-light)';
              }

              return (
                <label
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${border}`,
                    background: bg,
                    cursor: submitted ? 'default' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="mc_option"
                    value={opt}
                    checked={isSelected}
                    onChange={() => !submitted && setSelectedOption(opt)}
                    disabled={submitted}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {currentEx.type === 'fill_in_blank' && (
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Digite a resposta correta..."
              className="input-field"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={submitted}
              required
            />
          </div>
        )}

        {!submitted ? (
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={currentEx.type === 'multiple_choice' ? !selectedOption : !inputText.trim()}
          >
            Confirmar Resposta
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: isCorrect ? 'var(--accent-success-bg)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${isCorrect ? 'var(--accent-success)' : '#ef4444'}`
              }}
            >
              {isCorrect ? (
                <CheckCircle2 size={22} color="var(--accent-success)" style={{ flexShrink: 0 }} />
              ) : (
                <XCircle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
              )}
              <div>
                <strong style={{ fontSize: '0.95rem', color: isCorrect ? 'var(--accent-success)' : '#ef4444' }}>
                  {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta.'}
                </strong>
                {currentEx.explanation && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {currentEx.explanation}
                  </p>
                )}
              </div>
            </div>

            <button type="button" onClick={handleNext} className="btn btn-primary" style={{ width: '100%' }}>
              {currentIndex < exercises.length - 1 ? 'Próximo Exercício' : 'Finalizar Homework'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
