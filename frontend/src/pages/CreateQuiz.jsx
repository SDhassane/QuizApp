import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './CreateQuiz.css';

function CreateQuiz() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual');
  
  // Infos du quiz
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState(600);

  // ⭐ Gestion de la catégorie personnalisée
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Questions
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      answers: [
        { answer_text: '', is_correct: true },
        { answer_text: '', is_correct: false },
        { answer_text: '', is_correct: false },
      ]
    }
  ]);

  // État IA
  const [topic, setTopic] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // --- GESTION MANUELLE ---
  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      answers: [
        { answer_text: '', is_correct: true },
        { answer_text: '', is_correct: false },
        { answer_text: '', is_correct: false },
      ]
    }]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  const updateQuestion = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].question_text = value;
    setQuestions(newQuestions);
  };

  const updateAnswer = (qIndex, aIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers[aIndex].answer_text = value;
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (qIndex, aIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers = newQuestions[qIndex].answers.map((a, i) => ({
      ...a,
      is_correct: i === aIndex
    }));
    setQuestions(newQuestions);
  };

  // --- GESTION IA ---
  const handleGenerateAI = async () => {
    if (!topic.trim()) return;
    setLoadingAI(true);
    try {
      const response = await api.post('/ai/generate', { topic });
      const aiQuestions = response.data.questions.map(q => ({
        question_text: q.question,
        answers: q.choices.map(choice => ({
          answer_text: choice,
          is_correct: choice === q.correct
        }))
      }));
      setQuestions(aiQuestions);
      if (!title) setTitle(topic);
    } catch (error) {
      console.error("Erreur IA", error);
      alert("Erreur lors de la génération.");
    }
    setLoadingAI(false);
  };

  // --- SAUVEGARDER ---
  const handleSave = async () => {
    if (!title.trim()) {
      alert("Donne un titre au quiz.");
      return;
    }

    if (isCustomCategory && !customCategoryName.trim()) {
      alert("Écris le nom de la nouvelle catégorie.");
      return;
    }

    try {
      const quizPayload = {
        title: title.trim(),
        difficulty: difficulty,
        time_limit: Number(timeLimit),
        description: "Quiz créé"
      };

      if (isCustomCategory) {
        quizPayload.custom_category_name = customCategoryName;
      } else {
        quizPayload.category_id = Number(categoryId) || 1;
      }

      const quizResponse = await api.post('/quizzes', quizPayload);
      const quizId = quizResponse.data.quiz.id;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        if (!q.question_text.trim()) {
          alert(`La question ${i + 1} est vide.`);
          return;
        }

        for (let j = 0; j < q.answers.length; j++) {
          if (!q.answers[j].answer_text.trim()) {
            alert(`La réponse ${j + 1} de la question ${i + 1} est vide.`);
            return;
          }
        }

        await api.post(`/quizzes/${quizId}/questions`, {
          question_text: q.question_text.trim(),
          points: 1,
          order: i + 1,
          answers: q.answers.map(a => ({
            answer_text: a.answer_text.trim(),
            is_correct: a.is_correct ? 1 : 0
          }))
        });
      }
      alert("Quiz créé avec succès !");
      navigate('/live');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorList = Object.values(error.response.data.errors).flat().join('\n');
        alert("Erreur de validation :\n" + errorList);
      } else {
        alert("Erreur : " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-page">
        <div className="create-container">
          <h1 className="create-title">📝 Créer un Quiz</h1>

          {/* CHOIX DU MODE */}
          <div className="mode-selector">
            <button 
              className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => setMode('manual')}
            >
              ✍️ Manuellement
            </button>
            <button 
              className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
              onClick={() => setMode('ai')}
            >
              🤖 Avec l'IA
            </button>
          </div>

          {/* INFOS DU QUIZ */}
          <div className="quiz-info">
            <input 
              className="ai-input" 
              placeholder="Titre du quiz" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
            <div className="info-row">
              {/* ⭐ SELECT CORRIGÉ AVEC LOGIQUE "AUTRE" */}
              <select 
                className="ai-input" 
                value={isCustomCategory ? 'custom' : categoryId} 
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategoryId(e.target.value);
                  }
                }}
              >
                <option value={1}>Sport</option>
                <option value={2}>Informatique</option>
                <option value={3}>Sciences</option>
                <option value="custom">➕ Autre (écrire)</option>
              </select>

              <select className="ai-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
              <input 
                type="number" 
                className="ai-input" 
                value={timeLimit} 
                onChange={(e) => setTimeLimit(e.target.value)} 
                placeholder="Temps (sec)"
              />
            </div>

            {/* ⭐ CHAMP DE TEXTE POUR CATÉGORIE PERSONNALISÉE */}
            {isCustomCategory && (
              <input
                className="ai-input"
                placeholder="Nom de la nouvelle catégorie (ex: Cinéma)"
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </div>

          {/* MODE IA */}
          {mode === 'ai' && (
            <div className="ai-generator">
              <input 
                className="ai-input" 
                placeholder="Sujet (ex: Les capitales d'Europe)" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
              />
              <button className="ai-btn" onClick={handleGenerateAI} disabled={loadingAI}>
                {loadingAI ? 'Génération...' : '🤖 Générer les questions'}
              </button>
            </div>
          )}

          {/* QUESTIONS */}
          <div className="questions-list">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question-block">
                <div className="question-header">
                  <h3>Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button className="remove-btn" onClick={() => removeQuestion(qIndex)}>❌</button>
                  )}
                </div>
                <input 
                  className="ai-input" 
                  placeholder="Texte de la question" 
                  value={q.question_text} 
                  onChange={(e) => updateQuestion(qIndex, e.target.value)} 
                />
                <div className="answers-list">
                  {q.answers.map((a, aIndex) => (
                    <div key={aIndex} className="answer-row">
                      <input 
                        type="radio" 
                        name={`correct-${qIndex}`} 
                        checked={a.is_correct} 
                        onChange={() => setCorrectAnswer(qIndex, aIndex)} 
                      />
                      <input 
                        className="ai-input" 
                        placeholder={`Réponse ${aIndex + 1}`} 
                        value={a.answer_text} 
                        onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="actions">
            <button className="ai-btn secondary" onClick={addQuestion}>➕ Ajouter une question</button>
            <button className="ai-btn" onClick={handleSave}>💾 Sauvegarder le Quiz</button>
          </div>

        </div>
      </div>
    </>
  );
}

export default CreateQuiz;