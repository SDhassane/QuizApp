<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Ai\Agents\QuizGenerator;
use Illuminate\Http\Request;

class AiQuizController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:100'
        ]);

        $topic = $request->topic;

        try {
            // On utilise l'Agent (méthode officielle du SDK)
            $response = (new QuizGenerator)->prompt(
                "Génère 5 questions sur le sujet : {$topic}"
            );

            $content = (string) $response;

            // Nettoyage des balises markdown éventuelles
            $content = preg_replace('/```json|```/', '', $content);
            $content = trim($content);

            $questions = json_decode($content, true);

            if (!$questions || !is_array($questions)) {
                return response()->json(['error' => 'L\'IA n\'a pas renvoyé un format valide.', 'raw' => $content], 500);
            }

            return response()->json(['questions' => $questions]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}