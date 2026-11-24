import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './LiveGame.css';

function LiveGameHost() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Polling toutes les 1 seconde
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

  const handleNextQuestion = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/game/${sessionId}/next`);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du passage à la question suivante.");
    }
    setLoading(false);
  };

  // --- ÉCRAN DE CHARGEMENT ---
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
    
    return (
      <>
        <Navbar />
        <div className="live-game-page">
          <div className="live-game-container" style={{ textAlign: 'center' }}>
            <h1 className="question-text">🏆 Partie terminée !</h1>
            <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Classement final</p>
            
            <div className="podium">
              {sortedPlayers.map((p, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
                return (
                  <div key={p.id} className={`podium-item podium-${idx}`}>
                    <span className="podium-rank">{medal}</span>
                    <span className="podium-name">{p.nickname}</span>
                    <span className="podium-score">{p.score} pts</span>
                  </div>
                );
              })}
            </div>
            

            <button 
              className="live-btn host-btn" 
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

  // --- ÉCRAN DE JEU ---
  return (
    <>
      <Navbar />
      <div className="live-game-page">
        <div className="live-game-container">
          <div className="live-game-header">
            <span className="live-game-badge">
              Question {(gameState.current_question_index || 0) + 1}
            </span>
            <span className="live-game-players">
              👥 {gameState.players?.length || 0} joueurs
            </span>
          </div>

          {gameState.question ? (
            <div className="question-display">
              <h1 className="question-text">{gameState.question.question_text}</h1>
              
              <div className="answers-grid">
                {gameState.question.answers.map((answer, idx) => (
                  <div key={answer.id} className={`answer-display answer-${idx}`}>
                    <span className="answer-letter">{String.fromCharCode(65 + idx)}</span>
                    <span className="answer-text">{answer.answer_text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="question-display">
              <h1 className="question-text">Chargement de la question...</h1>
            </div>
          )}

          {error && <p style={{ color: '#ef4444' }}>{error}</p>}

          <button
            className="live-btn host-btn"
            onClick={handleNextQuestion}
            disabled={loading || !gameState.question}
            style={{ marginTop: '2rem', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}
          >
            {loading ? '...' : 'Suivant →'}
          </button>
        </div>
      </div>
    </>
  );
}

export default LiveGameHost;