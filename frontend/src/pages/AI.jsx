import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import './AI.css';

function AI() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/ai/generate', { topic });
      setQuestions(response.data.questions);
      setCurrentQuestion(0);
      setScore(0);
      setFinished(false);
      setSelectedAnswer(null);
    } catch (error) {
      alert("Erreur lors de la génération du quiz. Réessaie.");
      console.error(error);
    }
    setLoading(false);
  };

  const handleAnswerClick = (choice) => {
    if (selectedAnswer) return;
    setSelectedAnswer(choice);
    
    const isCorrect = choice === questions[currentQuestion].correct;
    if (isCorrect) setScore(score + 1);

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setFinished(true);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="ai-page">
          <div className="ai-loading">
            <h2>🤖 L'IA prépare ton quiz...</h2>
            <p>Ça prend quelques secondes</p>
          </div>
        </div>
      </>
    );
  }

  if (finished && questions) {
    return (
      <>
        <Navbar />
        <div className="ai-page">
          <div className="ai-result">
            <h1>Quiz Terminé ! 🎉</h1>
            <p className="score">{score} / {questions.length}</p>
            <p className="score-text">bonnes réponses</p>
            <button 
              className="ai-btn" 
              onClick={() => { 
                setFinished(false); 
                setQuestions(null); 
                setTopic(''); 
              }}
            >
              Créer un nouveau quiz
            </button>
          </div>
        </div>
      </>
    );
  }

  if (questions && !finished) {
    const q = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <>
        <Navbar />
        <div className="ai-page">
          <div className="ai-game">
            <div className="ai-game-header">
              <span>Question {currentQuestion + 1} / {questions.length}</span>
              <span>Score: {score}</span>
            </div>
            
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>

            <h2 className="ai-question">{q.question}</h2>

            <div className="ai-choices">
              {q.choices.map((choice, idx) => {
                let btnClass = "ai-choice-btn";
                if (selectedAnswer) {
                  if (choice === q.correct) btnClass += " correct";
                  else if (choice === selectedAnswer) btnClass += " wrong";
                }

                return (
                  <button
                    key={idx}
                    className={btnClass}
                    onClick={() => handleAnswerClick(choice)}
                    disabled={!!selectedAnswer}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="ai-page">
        <div className="ai-container">
          <h1 className="ai-title">🤖 Défier l'IA</h1>
          <p className="ai-subtitle">
            Donne un sujet et notre intelligence artificielle créera un quiz sur mesure pour toi.
          </p>

          <form onSubmit={handleGenerate} className="ai-form">
            <input
              type="text"
              className="ai-input"
              placeholder="Ex: Les capitales d'Europe, La guerre froide..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="ai-btn" disabled={loading || !topic.trim()}>
              {loading ? 'Génération...' : 'Générer le Quiz'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AI;