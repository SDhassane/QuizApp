<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

class QuizGenerator implements Agent
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'Tu es un générateur de quiz. Tu dois générer exactement 5 questions à choix multiples (QCM) sur le sujet demandé. Chaque question doit avoir 4 réponses possibles et une seule bonne réponse. Tu dois renvoyer UNIQUEMENT un tableau JSON valide, sans aucun texte avant ou après, avec cette structure exacte :
        [
          {
            "question": "Le texte de la question ?",
            "choices": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
            "correct": "La bonne réponse (le texte exact d\'un des choix)"
          }
        ]';
    }
}