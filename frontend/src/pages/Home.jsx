import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

function Home() {
  return (
    <>
      <Navbar />
      <div className="home-page">
        <h1 className="hero-title">🎯 QuizApp</h1>
        <p className="hero-subtitle">Choisis ton mode de jeu pour commencer</p>

        <div className="modes-container">
          <Link to="/live" className="mode-card">
            <div className="mode-icon">🎮</div>
            <h2 className="mode-title">Partie en Direct</h2>
            <p className="mode-desc">
              Crée une partie, invite tes amis avec un code PIN et jouez ensemble en temps réel.
            </p>
            <button className="mode-btn live-btn">Créer / Rejoindre</button>
          </Link>

          <Link to="/ai" className="mode-card">
            <div className="mode-icon">🤖</div>
            <h2 className="mode-title">Défier l'IA</h2>
            <p className="mode-desc">
              Donne un sujet à notre intelligence artificielle et elle générera un quiz sur mesure.
            </p>
            <button className="mode-btn ai-btn">Générer un Quiz</button>
          </Link>

          {/* ⭐ NOUVELLE CARTE : Espace d'Apprentissage */}
          <Link to="/learning" className="mode-card">
            <div className="mode-icon">🎓</div>
            <h2 className="mode-title">Espace d'Apprentissage</h2>
            <p className="mode-desc">
              Discute avec nos professeurs virtuels experts en Informatique, Langues ou Football.
            </p>
            <button className="mode-btn" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
              Réviser avec l'IA
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;