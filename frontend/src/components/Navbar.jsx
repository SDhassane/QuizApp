import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLogged(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">🎯 QuizApp</NavLink>
      
      <div className="navbar-links">
        <NavLink to="/" className="nav-link">Accueil</NavLink>
        <NavLink to="/live" className="nav-link">Live</NavLink>
        <NavLink to="/ai" className="nav-link">IA</NavLink>
        
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {/* Bouton Connexion / Déconnexion */}
          {isLogged ? (
            <button className="icon-btn login-btn" onClick={handleLogout}>
              🚪 Déconnexion
            </button>
          ) : (
            <NavLink to="/login" className="icon-btn login-btn">
              🔑 Connexion
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;