import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './Login.css'; // On réutilise un peu le style

function Learning() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await api.get('/tutors');
        setTutors(response.data);
      } catch (err) {
        setError("Impossible de charger les professeurs. Es-tu bien connecté ?");
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  if (loading) return <div className="login-page"><p>Chargement de tes profs...</p></div>;
  if (error) return <div className="login-page"><p className="login-error">{error}</p></div>;

  return (
    <>
      <Navbar />
      <div className="login-page">
        <div className="login-container" style={{ maxWidth: '800px' }}>
          <h1 className="login-title">🎓 Mon Espace d'Apprentissage</h1>
          <p className="login-subtitle">Choisis un professeur pour commencer à réviser.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
            {tutors.map((tutor) => (
              <div 
                key={tutor.id} 
                className="ai-card"
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  backgroundColor: '#fff'
                }}
                onClick={() => navigate(`/chat/${tutor.id}`)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: '50px', marginBottom: '10px' }}>{tutor.avatar}</div>
                <h3 style={{ margin: '10px 0', color: '#333' }}>{tutor.name}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{tutor.subject}</p>
                <button className="ai-btn" style={{ marginTop: '15px' }}>Discuter</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Learning;