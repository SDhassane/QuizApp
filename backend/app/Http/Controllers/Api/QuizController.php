<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    // Liste tous les quiz publiés
    public function index()
    {
        return response()->json(Quiz::with('category', 'creator')->where('is_published', true)->get());
    }

    // Afficher un quiz avec ses questions (sans is_correct)
    public function show($id)
    {
        $quiz = Quiz::with(['questions.answers' => function($query) {
            $query->select('id', 'question_id', 'answer_text');
        }])->findOrFail($id);
        
        return response()->json($quiz);
    }

    // Calculer le score après un quiz
    public function submit(Request $request, $id)
    {
        $quiz = Quiz::with('questions.answers')->findOrFail($id);
        $userAnswers = $request->input('answers', []);
        
        $score = 0;
        $total = 0;
        $corrections = [];

        foreach ($quiz->questions as $question) {
            $total += $question->points;
            $correctAnswer = $question->answers->where('is_correct', 1)->first();
            $userAnswerId = isset($userAnswers[$question->id]) ? (int)$userAnswers[$question->id] : null;
            
            $isCorrect = ($userAnswerId !== null && $correctAnswer && $userAnswerId === (int)$correctAnswer->id);
            
            if ($isCorrect) {
                $score += $question->points;
            }

            $corrections[] = [
                'question' => $question->question_text,
                'your_answer' => $userAnswerId && $question->answers->find($userAnswerId) ? $question->answers->find($userAnswerId)->answer_text : "Aucune réponse",
                'correct_answer' => $correctAnswer ? $correctAnswer->answer_text : "Inconnue",
                'is_correct' => $isCorrect
            ];
        }

        return response()->json([
            'score' => $score,
            'total' => $total,
            'corrections' => $corrections
        ]);
    }

    // ⭐ NOUVELLE FONCTION : Créer un quiz
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:200',
            'difficulty' => 'required|in:easy,medium,hard',
            'time_limit' => 'required|integer|min:30',
        ]);

        // Gérer la catégorie
        $categoryId = $request->category_id;

        if ($request->custom_category_name) {
            $slug = Str::slug($request->custom_category_name);
            $category = Category::firstOrCreate(
                ['slug' => $slug],
                ['name' => $request->custom_category_name, 'icon' => '📁']
            );
            $categoryId = $category->id;
        }

        // Créer le quiz
        $quiz = Quiz::create([
            'title' => $request->title,
            'description' => $request->description ?? 'Quiz créé',
            'category_id' => $categoryId,
            'difficulty' => $request->difficulty,
            'time_limit' => $request->time_limit,
            'user_id' => $request->user()->id,
            'is_published' => true,
        ]);

        return response()->json(['message' => 'Quiz créé', 'quiz' => $quiz], 201);
    }

    // ⭐ NOUVELLE FONCTION : Ajouter une question
    public function addQuestion(Request $request, $quizId)
    {
        $request->validate([
            'question_text' => 'required|string',
            'points' => 'required|integer|min:1',
            'order' => 'required|integer',
            'answers' => 'required|array|min:2',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        return DB::transaction(function () use ($request, $quizId) {
            $quiz = Quiz::findOrFail($quizId);

            $question = $quiz->questions()->create([
                'question_text' => $request->question_text,
                'points' => $request->points,
                'order' => $request->order,
            ]);

            foreach ($request->answers as $answerData) {
                $question->answers()->create([
                    'answer_text' => $answerData['answer_text'],
                    'is_correct' => $answerData['is_correct'],
                ]);
            }

            return response()->json([
                'message' => 'Question ajoutée avec succès',
                'question' => $question->load('answers')
            ], 201);
        });
    }
}