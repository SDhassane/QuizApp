import { useLocation, useNavigate } from 'react-router-dom';

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // On récupère UNIQUEMENT les résultats calculés par Laravel
  const { results } = location.state || {};
  console.log("CE QUE LARAVEL A RENVOYÉ :", results);

  // Si on n'a pas de résultats (ex: on a rechargé la page), on affiche une erreur
  if (!results) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Aucun résultat à afficher.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 px-6 py-2 rounded-lg">Retour à l'accueil</button>
      </div>
    );
  }

  // Calcul du pourcentage
  const percentage = results.total > 0 ? Math.round((results.score / results.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* En-tête du score */}
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Quiz Terminé ! 🎉</h1>
          <div className="text-5xl font-bold mb-2">
            <span className={percentage >= 50 ? 'text-green-500' : 'text-red-500'}>
              {percentage}%
            </span>
          </div>
          <p className="text-xl text-gray-300">
            Score : {results.score} / {results.total} points
          </p>
        </div>

        {/* Détail des questions (affiché tel quel par Laravel) */}
        <h2 className="text-2xl font-bold mb-4">Détail de tes réponses :</h2>
        <div className="space-y-4 mb-8">
          {results.corrections.map((item, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-xl border-2 ${item.is_correct ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{item.is_correct ? '✅' : '❌'}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{index + 1}. {item.question}</h3>
                  
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-400">Ta réponse : </span>
                      <span className={item.is_correct ? 'text-green-400' : 'text-red-400'}>
                        {item.your_answer}
                      </span>
                    </p>
                    
                    {!item.is_correct && (
                      <p>
                        <span className="text-gray-400">Bonne réponse : </span>
                        <span className="text-green-400">{item.correct_answer}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate('/')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

export default Result;