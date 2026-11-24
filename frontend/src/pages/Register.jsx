import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './Login.css'; 

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/register', { 
        name, 
        email, 
        password,
        role 
      });
      
      // ⭐ On stocke le token ET les infos de l'utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user)); 
      
      // ⭐ On redirige tout le monde vers la page d'accueil
      navigate('/'); 
      
      // Optionnel : on recharge la page pour que la Navbar se mette à jour immédiatement
      window.location.reload(); 
      
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'inscription.";
      setError(message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="login-page">
        <div className="login-container">
          <h1 className="login-title">📝 Inscription</h1>
          <p className="login-subtitle">Crée ton compte pour jouer et apprendre.</p>

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={handleRegister} className="login-form">
            <input
              type="text"
              className="ai-input"
              placeholder="Nom (ex: Hassan)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="Mot de passe (6 caractères min)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className="ai-input"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div style={{ margin: '15px 0', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Je m'inscris en tant que :
              </label>
              <label style={{ marginRight: '20px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  value="student" 
                  checked={role === 'student'} 
                  onChange={(e) => setRole(e.target.value)} 
                /> Étudiant
              </label>
              <label style={{ cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  value="teacher" 
                  checked={role === 'teacher'} 
                  onChange={(e) => setRole(e.target.value)} 
                /> Professeur
              </label>
            </div>

            <button type="submit" className="ai-btn" disabled={loading}>
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <p className="login-switch">
            Déjà un compte ?{' '}
            <Link to="/login" className="login-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;