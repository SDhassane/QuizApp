import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Live from './pages/Live';
import LiveCreate from './pages/LiveCreate';
import LiveJoin from './pages/LiveJoin';
import AI from './pages/AI';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateQuiz from './pages/CreateQuiz';
import LiveGameHost from './pages/LiveGameHost';
import LiveGamePlayer from './pages/LiveGamePlayer';
import Learning from './pages/Learning'; 
import Chat from './pages/Chat'; // ⭐ NOUVEL IMPORT

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live" element={<Live />} />
        
        {/* Lobby Hôte */}
        <Route path="/live/host/:sessionId" element={<LiveCreate />} />
        
        {/* Lobby Joueur */}
        <Route path="/live/player/:sessionId" element={<LiveJoin />} />
        
        {/* ⭐ Jeu en direct - Hôte */}
        <Route path="/live/game/host/:sessionId" element={<LiveGameHost />} />
        
        {/* ⭐ Jeu en direct - Joueur */}
        <Route path="/live/game/player/:sessionId" element={<LiveGamePlayer />} />
        
        <Route path="/ai" element={<AI />} />
        
        {/* Pages d'authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Page de création de quiz */}
        <Route path="/create-quiz" element={<CreateQuiz />} />

        {/* ⭐ NOUVELLE ROUTE : Espace d'apprentissage */}
        <Route path="/learning" element={<Learning />} />

        {/* ⭐ NOUVELLE ROUTE : Chat avec un prof */}
        <Route path="/chat/:tutorId" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;