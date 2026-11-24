import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', { email, password });
      localStorage.setItem('token', response.data.token);
      // Redirection vers la page précédente ou l'accueil
      navigate('/');
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="login-page">
        <div className="login-container">
                      {/* Lien vers Register */}
          <p className="login-switch">
            Pas encore de compte ?{' '}
            <Link to="/register" className="login-link">
              S'inscrire
            </Link>
          </p>
          <h1 className="login-title">🔑 Connexion</h1>
          <p className="login-subtitle">Connecte-toi pour accéder au mode Live.</p>

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              className="ai-input"
              placeholder="Email (ex: hassan@test.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="ai-input"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="ai-btn" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;