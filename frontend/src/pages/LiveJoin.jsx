import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './Live.css';

function LiveJoin() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const player = location.state?.player;
  const pin = location.state?.pin;

  // 1. Vérifier toutes les 1 seconde si la partie a démarré
  useEffect(() => {
    if (!sessionId) return;

    const checkStatus = async () => {
      try {
        const response = await api.get(`/game/${sessionId}/state`);
        
        // Si l'hôte a démarré la partie, on redirige vers le jeu
        if (response.data.status === 'playing') {
          navigate(`/live/game/player/${sessionId}`, { 
            state: { player, pin } 
          });
        }
      } catch (err) {
        console.error("Erreur vérification statut", err);
      }
    };

    checkStatus(); // Premier appel immédiat
    const interval = setInterval(checkStatus, 1000);

    return () => clearInterval(interval);
  }, [sessionId, navigate, player, pin]);

  return (
    <>
      <Navbar />
      <div className="live-page">
        <div className="live-container" style={{ textAlign: 'center' }}>
          <h1 className="live-title">🎮 Tu es dans la partie !</h1>
          <p className="live-subtitle">En attente du démarrage par l'hôte...</p>
          
          <div className="pin-display">
            <p className="pin-label">Ton pseudo</p>
            <h2 className="pin-code" style={{ fontSize: '3rem', letterSpacing: '0.2rem' }}>
              {player?.nickname}
            </h2>
            <p className="pin-hint">Code de la partie : {pin}</p>
          </div>

          <div style={{ marginTop: '2rem', fontSize: '3rem' }}>⏳</div>
          <p style={{ color: 'var(--text-sub)', marginTop: '1rem' }}>
            La partie va bientôt commencer...
          </p>
        </div>
      </div>
    </>
  );
}

export default LiveJoin;