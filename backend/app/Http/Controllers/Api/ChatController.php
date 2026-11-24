<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiTutor;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    // Récupérer l'historique des messages avec un prof
    public function index($tutorId)
    {
        $messages = Message::where('user_id', auth()->id())
            ->where('ai_tutor_id', $tutorId)
            ->orderBy('created_at', 'asc')
            ->get();
            
        return response()->json($messages);
    }

    // Envoyer un message et avoir la réponse de l'IA (Groq)
    public function send(Request $request, $tutorId)
    {
        $request->validate(['content' => 'required|string']);

        $tutor = AiTutor::findOrFail($tutorId);
        
        // 1. On sauvegarde le message de l'élève
        Message::create([
            'user_id' => auth()->id(),
            'ai_tutor_id' => $tutorId,
            'role' => 'user',
            'content' => $request->content
        ]);

        // 2. On prépare l'historique pour l'IA
        $history = Message::where('user_id', auth()->id())
            ->where('ai_tutor_id', $tutorId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();

        // 3. On ajoute le "System Prompt" du prof au début
        array_unshift($history,         // ⭐ RÈGLE MISE A JOUR : Anti-hallucination
        $history[] = [
            'role' => 'system',
            'content' => "RÈGLES ABSOLUES : Sois très bref (2 phrases max). N'utilise JAMAIS de tableaux, de titres (#) ou de listes à puces. INTERDICTION d'utiliser des blocs de code (les trois backticks). Écris le code directement dans la phrase. Si on te pose une question sur l'actualité récente (moins d'un an) ou un fait que tu ne connais pas avec certitude, réponds EXACTEMENT : 'Je n'ai pas accès aux informations en temps réel, je ne peux pas te confirmer cela.' N'invente JAMAIS une réponse."
        ]);

        // ⭐ RÈGLE MISE A JOUR : Interdiction de faire des blocs de code qui buguent
        $history[] = [
            'role' => 'system',
            'content' => "RÈGLES ABSOLUES : Sois très bref (2 phrases max). N'utilise JAMAIS de tableaux, de titres (#) ou de listes à puces. INTERDICTION d'utiliser des blocs de code (les trois backticks). Écris le code directement dans la phrase."
        ];

        // 4. On appelle l'API de Groq
        $apiKey = env('GROQ_API_KEY'); 
        
        $response = Http::withToken($apiKey)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => 'openai/gpt-oss-120b',
            'messages' => $history,
            'max_tokens' => 1000,     // ⭐ Augmenté à 300 pour qu'il ait le temps de finir sa phrase
            'temperature' => 0.3,    // ⭐ Un peu plus libre pour ne pas buguer
        ]);

        // Gestion des erreurs de l'API
        if ($response->failed()) {
            \Log::error('Erreur Groq: ' . $response->body());
            return response()->json(['error' => 'L\'IA a rencontré un problème. Vérifie tes logs.'], 500);
        }

        $aiReplyContent = $response->json('choices.0.message.content') ?? "Désolé, je n'ai pas pu répondre.";

        // 5. On sauvegarde la réponse de l'IA
        $aiMessage = Message::create([
            'user_id' => auth()->id(),
            'ai_tutor_id' => $tutorId,
            'role' => 'assistant',
            'content' => $aiReplyContent
        ]);

        return response()->json($aiMessage);
    }

    // Supprimer l'historique quand on quitte la page
    public function destroy($tutorId)
    {
        Message::where('user_id', auth()->id())
            ->where('ai_tutor_id', $tutorId)
            ->delete();
            
        return response()->json(['message' => 'Conversation effacée']);
    }
}