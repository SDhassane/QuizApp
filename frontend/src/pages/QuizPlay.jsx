import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false); // Empêche le double envoi

  // 1. Charger le quiz
  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then(res => {
        setQuiz(res.data);
        setTimeLeft(res.data.time_limit);
      })
      .catch(err => console.error(err));
  }, [id]);

  // 2. Gérer le chronomètre
  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Si le temps est écoulé, on force la fin avec les réponses actuelles
          handleFinish(answers); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeLeft, answers]);

  // 3. Clic sur une réponse
  const handleAnswerClick = (questionId, answerId) => {
    if (isFinishing) return;

    // On crée les nouvelles réponses
    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);

    // On attend 300ms pour le visuel, puis on avance
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // DERNIÈRE QUESTION : On envoie DIRECTEMENT les nouvelles réponses !
        handleFinish(newAnswers);
      }
    }, 300);
  };

  // 4. Terminer le quiz (Prend les réponses en paramètre)
  const handleFinish = async (finalAnswers) => {
    if (isFinishing) return;
    setIsFinishing(true);

    try {
      console.log("ENVOI LARAVEL :", finalAnswers);
      
      const response = await api.post(`/quizzes/${quiz.id}/submit`, { 
        answers: finalAnswers 
      });
      
      navigate('/result', { state: { results: response.data } });
    } catch (error) {
      console.error("Erreur", error);
      alert("Erreur lors de l'envoi du score.");
      setIsFinishing(false);
    }
  };

  if (!quiz) return <div className="text-center mt-10 text-xl text-white bg-gray-900 min-h-screen flex items-center justify-center">Chargement...</div>;

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <span className="text-xl font-bold bg-gray-800 px-4 py-2 rounded-lg">
            ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-gray-400">Question {currentQuestion + 1} / {quiz.questions.length}</span>
        </div>

        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-8">
          <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-center">{question.question_text}</h2>

        <div className="grid gap-4 mb-8">
          {question.answers.map(answer => (
            <button
              key={answer.id}
              onClick={() => handleAnswerClick(question.id, answer.id)}
              disabled={!!answers[question.id] || isFinishing}
              className={`text-left p-4 rounded-xl transition border-2 ${
                answers[question.id] === answer.id 
                  ? 'bg-blue-600 border-blue-400 scale-[1.02]' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500'
              }`}
            >
              {answer.answer_text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuizPlay;