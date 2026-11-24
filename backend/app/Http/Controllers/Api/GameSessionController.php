<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\Player;
use Illuminate\Http\Request;

class GameSessionController extends Controller
{
    // 1. Créer une nouvelle partie (Hôte)
    public function create(Request $request)
    {
        $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
        ]);

        do {
            $pin = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (GameSession::where('pin', $pin)->exists());

        $session = GameSession::create([
            'pin' => $pin,
            'host_id' => $request->user()->id,
            'quiz_id' => $request->quiz_id,
            'status' => 'waiting',
            'current_question_index' => 0,
        ]);

        return response()->json([
            'message' => 'Partie créée',
            'session' => $session,
            'pin' => $pin
        ], 201);
    }

    // 2. Rejoindre une partie (Joueur)
    public function join(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|size:6',
            'nickname' => 'required|string|max:50',
        ]);

        $session = GameSession::where('pin', $request->pin)->first();

        if (!$session) {
            return response()->json(['error' => 'Aucune partie trouvée avec ce code PIN.'], 404);
        }

        if ($session->status !== 'waiting') {
            return response()->json(['error' => 'Cette partie a déjà commencé.'], 400);
        }

        $exists = Player::where('game_session_id', $session->id)
            ->where('nickname', $request->nickname)
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'Ce pseudo est déjà pris dans cette partie.'], 400);
        }

        $player = Player::create([
            'game_session_id' => $session->id,
            'user_id' => $request->user()?->id,
            'nickname' => $request->nickname,
            'score' => 0,
        ]);

        return response()->json([
            'message' => 'Connexion réussie',
            'session' => $session,
            'player' => $player,
        ]);
    }

    // 3. Démarrer la partie (Hôte)
    public function start(Request $request, $id)
    {
        $session = GameSession::findOrFail($id);

        if ($session->host_id !== $request->user()->id) {
            return response()->json(['error' => 'Tu n\'es pas l\'hôte de cette partie.'], 403);
        }

        $session->update(['status' => 'playing']);

        return response()->json(['message' => 'Partie démarrée', 'session' => $session]);
    }

    // 4. Lister les joueurs d'une session (pour l'hôte)
    public function players($id)
    {
        $session = GameSession::with('players')->findOrFail($id);
        return response()->json($session->players);
    }

    // 5. ⭐ Récupérer l'état du jeu (polling)
    public function getGameState($id)
    {
        $session = GameSession::with(['quiz.questions.answers', 'players'])->findOrFail($id);
        
        $currentQuestion = null;
        if ($session->status === 'playing') {
            $currentQuestion = $session->quiz->questions[$session->current_question_index] ?? null;
            
            if ($currentQuestion) {
                // On cache is_correct pour éviter la triche côté client
                $currentQuestion->answers->makeHidden('is_correct');
            }
        }

        return response()->json([
            'status' => $session->status,
            'current_question_index' => $session->current_question_index,
            'question' => $currentQuestion,
            'players' => $session->players,
        ]);
    }

    // 6. ⭐ Soumettre une réponse
    public function submitAnswer(Request $request, $id)
    {
        $request->validate([
            'player_id' => 'required|exists:players,id',
            'answer_id' => 'required|exists:answers,id',
        ]);

        $session = GameSession::with('quiz.questions.answers')->findOrFail($id);
        $question = $session->quiz->questions[$session->current_question_index] ?? null;

        if (!$question) {
            return response()->json(['error' => 'Question introuvable'], 404);
        }

        $chosenAnswer = $question->answers->find($request->answer_id);
        $isCorrect = $chosenAnswer && $chosenAnswer->is_correct;

        if ($isCorrect) {
            $player = Player::find($request->player_id);
            $player->score += 10; // +10 points par bonne réponse
            $player->save();
        }

        return response()->json([
            'is_correct' => $isCorrect,
            'new_score' => $isCorrect ? Player::find($request->player_id)->score : null
        ]);
    }

    // 7. ⭐ Passer à la question suivante (Hôte)
    public function nextQuestion(Request $request, $id)
    {
        $session = GameSession::with('quiz.questions')->findOrFail($id);
        
        $nextIndex = $session->current_question_index + 1;

        if ($nextIndex >= $session->quiz->questions->count()) {
            $session->update(['status' => 'finished']);
            return response()->json(['message' => 'Partie terminée', 'status' => 'finished']);
        }

        $session->update(['current_question_index' => $nextIndex]);
        return response()->json(['message' => 'Question suivante', 'status' => 'playing', 'index' => $nextIndex]);
    }
}