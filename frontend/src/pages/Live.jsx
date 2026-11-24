import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './Live.css';

function Live() {
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showQuizList, setShowQuizList] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (showQuizList) {
      api.get('/quizzes').then(res => setQuizzes(res.data)).catch(console.error);
    }
  }, [showQuizList]);

  const handleCreateClick = () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    setShowQuizList(true);
  };

  const handleCreateWithQuiz = async (quizId) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/game/create', { quiz_id: quizId });
      navigate(`/live/host/${response.data.session.id}`, { 
        state: { pin: response.data.pin } 
      });
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création de la partie.");
    }
    setLoading(false);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (pin.length !== 6 || !nickname.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/game/join', { pin, nickname });
      navigate(`/live/player/${response.data.session.id}`, { 
        state: { player: response.data.player, pin } 
      });
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la connexion.");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="live-page">
        <div className="live-container">
          <h1 className="live-title">🎮 Mode Live</h1>
          <p className="live-subtitle">Joue en temps réel avec tes amis</p>

          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

          {showQuizList ? (
            <div className="quiz-selection">
              <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem' }}>
                Choisis le quiz à jouer :
              </h2>
              
              {quizzes.length === 0 ? (
                <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>
                  Tu n'as aucun quiz pour l'instant.
                </p>
              ) : (
                <div className="quiz-options-list">
                  {quizzes.map(quiz => (
                    <button 
                      key={quiz.id} 
                      className="quiz-choice-btn"
                      onClick={() => handleCreateWithQuiz(quiz.id)}
                      disabled={loading}
                    >
                      <span className="quiz-choice-title">{quiz.title}</span>
                      <span className="quiz-choice-info"></span>
                    </button>
                  ))}
                </div>
              )}

              {/* BOUTON TOUJOURS VISIBLE */}
              <button 
                className="live-btn host-btn" 
                onClick={() => navigate('/create-quiz')}
                style={{ marginTop: '2rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}
              >
                ➕ Créer un nouveau quiz
              </button>

              <button 
                className="ai-btn secondary" 
                onClick={() => setShowQuizList(false)}
                style={{ marginTop: '1rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}
              >
                ← Retour
              </button>
            </div>
          ) : (
            <div className="live-actions">
              <div className="live-card">
                <h2>🎯 Je suis l'hôte</h2>
                <p>Crée une partie et invite tes amis avec un code PIN.</p>
                <button className="live-btn host-btn" onClick={handleCreateClick} disabled={loading}>
                  {loading ? 'Chargement...' : 'Créer une partie'}
                </button>
              </div>

              <div className="live-card">
                <h2>🎮 Je suis un joueur</h2>
                <p>Entre le code PIN et ton pseudo.</p>
                <form onSubmit={handleJoin} className="join-form">
                  <input
                    type="text"
                    className="pin-input"
                    placeholder="Code PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  <input
                    type="text"
                    className="ai-input"
                    placeholder="Ton pseudo"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                  />
                  <button 
                    type="submit" 
                    className="live-btn join-btn"
                    disabled={pin.length !== 6 || !nickname.trim() || loading}
                  >
                    {loading ? 'Connexion...' : 'Rejoindre'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Live;