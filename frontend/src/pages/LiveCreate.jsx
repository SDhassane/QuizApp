import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './Live.css';

function LiveCreate() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // On récupère le PIN passé par Live.jsx
  const pin = location.state?.pin || '------';
  
  const [players, setPlayers] = useState([]);

  // Rafraîchir la liste des joueurs toutes les 2 secondes
  useEffect(() => {
    if (!sessionId) return;

    const fetchPlayers = async () => {
      try {
        const response = await api.get(`/game/${sessionId}/players`);
        setPlayers(response.data);
      } catch (err) {
        console.error("Erreur rafraîchissement joueurs", err);
      }
    };

    fetchPlayers(); // Premier appel immédiat
    const interval = setInterval(fetchPlayers, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

const handleStart = async () => {
  try {
    await api.post(`/game/${sessionId}/start`);
    // Redirection vers la page de jeu en direct (hôte)
    navigate(`/live/game/host/${sessionId}`);
  } catch (err) {
    console.error(err);
    alert("Erreur lors du démarrage.");
  }
};
  return (
    <>
      <Navbar />
      <div className="live-page">
        <div className="live-container">
          <h1 className="live-title">🎮 Salle d'attente</h1>
          <p className="live-subtitle">En attente des joueurs...</p>

          {/* Le PIN en très grand */}
          <div className="pin-display">
            <p className="pin-label">Code PIN de la partie</p>
            <h2 className="pin-code">{pin}</h2>
            <p className="pin-hint">Les joueurs entrent ce code sur leur téléphone</p>
          </div>

          {/* Liste des joueurs */}
          <div className="players-list">
            <h3 className="players-title">
              Joueurs connectés ({players.length})
            </h3>
            {players.length === 0 ? (
              <p className="no-players">Aucun joueur pour le moment...</p>
            ) : (
              <div className="players-grid">
                {players.map((p) => (
                  <div key={p.id} className="player-chip">
                    👤 {p.nickname}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton Démarrer */}
          <button
            className="live-btn host-btn start-btn"
            onClick={handleStart}
            disabled={players.length === 0}
          >
            {players.length === 0 ? 'En attente de joueurs...' : 'Démarrer la partie 🚀'}
          </button>
        </div>
      </div>
    </>
  );
}

export default LiveCreate;