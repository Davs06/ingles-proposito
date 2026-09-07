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
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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
      <div className="glass-panel animate-fade-in" style={{ padding: '28px 20px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-success)', margin: '0 auto 14px auto' }}>
          <Award size={28} />
        </div>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Homework Concluído!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px' }}>
          Você acertou <strong>{scoreCount} de {exercises.length}</strong> exercícios ({finalPercent}% de aproveitamento).
        </p>
        <button onClick={handleRestart} className="btn btn-secondary btn-sm" style={{ margin: '0 auto' }}>
          <RefreshCw size={15} /> Refazer Exercícios
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
        <div className="tag tag-blue" style={{ fontSize: '0.68rem' }}>
          Exercício {currentIndex + 1} de {exercises.length}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {currentEx.type === 'multiple_choice' 
            ? 'Múltipla Escolha' 
            : currentEx.type === 'discursive' 
              ? 'Questão Discursiva (Avançado)' 
              : 'Preenchimento de Lacuna'}
        </span>
      </div>

      <h4 style={{ fontSize: '1.05rem', lineHeight: '1.35', marginBottom: '16px' }}>
        {currentEx.question}
      </h4>

      <form onSubmit={handleSubmit}>
        {currentEx.type === 'multiple_choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {currentEx.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              let border = 'var(--border-color)';
              let bg = 'var(--bg-secondary)';

              if (submitted) {
                if (opt.toLowerCase() === currentEx.correct_answer.toLowerCase()) {
                  border = 'var(--accent-success)';
                  bg = 'var(--accent-success-bg)';
                } else if (isSelected && !isCorrect) {
                  border = 'var(--accent-warning)';
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
                    gap: '10px',
                    padding: '10px 14px',
                    minHeight: '44px',
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
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.3' }}>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {currentEx.type === 'fill_in_blank' && (
          <div style={{ marginBottom: '16px' }}>
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

        {currentEx.type === 'discursive' && (
          <div style={{ marginBottom: '16px' }}>
            <textarea
              placeholder="Escreva sua resposta completa em inglês..."
              className="input-field"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={submitted}
              required
              style={{ lineHeight: '1.5' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Questão Discursiva (Turma Avançada)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0} palavra(s)
              </span>
            </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: isCorrect ? 'var(--accent-success-bg)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${isCorrect ? 'var(--accent-success)' : 'var(--accent-warning)'}`
              }}
            >
              {isCorrect ? (
                <CheckCircle2 size={20} color="var(--accent-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <XCircle size={20} color="var(--accent-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.9rem', color: isCorrect ? 'var(--accent-success)' : 'var(--accent-warning)', display: 'block', marginBottom: '4px' }}>
                  {currentEx.type === 'discursive'
                    ? 'Resposta Registrada!'
                    : isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta.'}
                </strong>

                {currentEx.type === 'discursive' && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', margin: '8px 0' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>Resposta de Referência do Professor:</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px', fontStyle: 'italic' }}>
                      "{currentEx.correct_answer}"
                    </p>
                  </div>
                )}

                {currentEx.explanation && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.35' }}>
                    <strong>Explicação / Feedback:</strong> {currentEx.explanation}
                  </p>
                )}
              </div>
            </div>

            <button type="button" onClick={handleNext} className="btn btn-primary" style={{ width: '100%' }}>
              {currentIndex < exercises.length - 1 ? 'Próximo Exercício' : 'Finalizar Homework'} <ArrowRight size={15} />
            </button>
          </div>
        )}

      </form>
    </div>
  );
}

