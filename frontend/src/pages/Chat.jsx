import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import ReactMarkdown from 'react-markdown'; 
import './Chat.css';

function Chat() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Charger l'historique
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${tutorId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Erreur chargement historique", err);
        if (err.response?.status === 401) { 
          navigate('/login');
        }
      } finally {
        setInitialLoading(false);
      }
    };
    fetchHistory();
  }, [tutorId, navigate]);

  // 2. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 3. Envoyer un message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]); 
    setInput('');
    setLoading(true);

    try {
      const res = await api.post(`/chat/${tutorId}`, { content: userMsg.content });
      setMessages(prev => [...prev, res.data]); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur lors de l'envoi du message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="chat-page">
        <div className="chat-container">
          
          {/* En-tête */}
          <div className="chat-header">
            <Link to="/learning" className="back-btn">⬅️</Link>
            <h2>Espace de discussion</h2>
          </div>

          {/* Zone des messages */}
          <div className="chat-messages">
            {initialLoading ? (
              <p className="chat-info-text">Chargement de la discussion...</p>
            ) : messages.length === 0 ? (
              <p className="chat-info-text">Pose ta première question au professeur !</p>
            ) : (
              messages.map((msg, index) => {
                // ⭐ SÉCURITÉ : Si l'IA renvoie un texte vide, on affiche un message par défaut
                const textContent = (msg.content && msg.content.trim() !== "") 
                  ? msg.content 
                  : "Désolé, je n'ai pas de réponse claire à te donner. Reformule ta question !";

                return (
                  <div 
                    key={index} 
                    className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{textContent}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                );
              })
            )}
            {loading && <p className="loading-text">Le professeur écrit... ⏳</p>}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris ta question ici..."
            />
            <button type="submit" disabled={loading}>
              Envoyer
            </button>
          </form>

        </div>
      </div>
    </>
  );
}

export default Chat;