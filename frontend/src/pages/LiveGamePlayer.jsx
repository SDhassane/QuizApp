import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './LiveGame.css';

function LiveGamePlayer() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const player = location.state?.player;
  const [gameState, setGameState] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!sessionId) return;

    const fetchState = async () => {
      try {
        const response = await api.get(`/game/${sessionId}/state`);
        setGameState(response.data);
      } catch (err) {
        console.error("Erreur rafraîchissement", err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setIsCorrect(null);
    setTimeLeft(15);
  }, [gameState?.current_question_index]);

  useEffect(() => {
    if (hasAnswered || !gameState?.question) return;
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, hasAnswered, gameState]);

  const handleAnswerClick = async (answerId) => {
    if (hasAnswered || !gameState?.question) return;

    setSelectedAnswer(answerId);
    setHasAnswered(true);

    try {
      const response = await api.post(`/game/${sessionId}/answer`, {
        player_id: player?.id,
        answer_id: answerId
      });
      setIsCorrect(response.data.is_correct);
    } catch (err) {
      console.error("Erreur envoi réponse", err);
    }
  };

  if (!gameState) {
    return (
      <>
        <Navbar />
        <div className="live-game-page">
          <p style={{ color: 'var(--text-main)' }}>Chargement...</p>
        </div>
      </>
    );
  }

  // --- ÉCRAN DE FIN (PODIUM) ---
  if (gameState.status === 'finished') {
    const sortedPlayers = [...(gameState.players || [])].sort((a, b) => b.score - a.score);
    const myRank = sortedPlayers.findIndex(p => p.id === player?.id) + 1;
    const myData = sortedPlayers.find(p => p.id === player?.id);

    return (
      <>
        <Navbar />
        <div className="live-game-page">
          <div className="live-game-container" style={{ textAlign: 'center' }}>
            <h1 className="question-text">🏆 Partie terminée !</h1>
            
            <div className="my-score-display">
              <p className="pin-label">Ton score</p>
              <p className="my-score-number">{myData?.score || 0} pts</p>
              <p className="pin-hint">Tu es {myRank}{myRank === 1 ? 'er' : 'ème'} sur {sortedPlayers.length}</p>
            </div>

            <h2 style={{ color: 'var(--text-main)', marginTop: '2rem', marginBottom: '1rem' }}>Classement</h2>
            <div className="podium">
              {sortedPlayers.map((p, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
                return (
                  <div key={p.id} className={`podium-item podium-${idx} ${p.id === player?.id ? 'me' : ''}`}>
                    <span className="podium-rank">{medal}</span>
                    <span className="podium-name">{p.nickname}{p.id === player?.id ? ' (Toi)' : ''}</span>
                    <span className="podium-score">{p.score} pts</span>
                  </div>
                );
              })}
            </div>

            <button 
              className="live-btn join-btn" 
              onClick={() => navigate('/live')}
              style={{ marginTop: '2rem', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}
            >
              Retour au menu
            </button>
          </div>
        </div>
      </>
    );
  }

  if (gameState.status === 'waiting' || !gameState.question) {
    return (
      <>
        <Navbar />
        <div className="live-game-page">
          <div className="live-game-container" style={{ textAlign: 'center' }}>
            <h1 className="question-text">En attente de la première question...</h1>
            <div style={{ marginTop: '2rem', fontSize: '4rem' }}>⏳</div>
          </div>
        </div>
      </>
    );
  }

  const q = gameState.question;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <>
      <Navbar />
      <div className="live-game-page">
        <div className="live-game-container">
          <div className="live-game-header">
            <span className="live-game-badge">
              Question {(gameState.current_question_index || 0) + 1}
            </span>
            <span className="live-game-timer">⏱️ {timeLeft}s</span>
          </div>

          <h1 className="question-text">{q.question_text}</h1>

          <div className="answers-grid">
            {q.answers.map((answer, idx) => {
              let btnClass = `answer-btn answer-${idx}`;
              if (hasAnswered && answer.id === selectedAnswer) {
                btnClass += isCorrect ? ' selected-correct' : ' selected-wrong';
              }

              return (
                <button
                  key={answer.id}
                  className={btnClass}
                  onClick={() => handleAnswerClick(answer.id)}
                  disabled={hasAnswered}
                >
                  <span className="answer-letter">{letters[idx]}</span>
                  <span className="answer-text">{answer.answer_text}</span>
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              {isCorrect ? (
                <p style={{ color: '#22c55e', fontSize: '1.5rem', fontWeight: 'bold' }}>✅ Bonne réponse ! +10 points</p>
              ) : (
                <p style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 'bold' }}>❌ Mauvaise réponse</p>
              )}
              <p style={{ color: 'var(--text-sub)', marginTop: '0.5rem' }}>En attente de la prochaine question...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LiveGamePlayer;