<?php

use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AiQuizController;
use App\Http\Controllers\Api\GameSessionController;
use App\Http\Controllers\Api\TutorController;
use App\Http\Controllers\Api\ChatController; 
use Illuminate\Support\Facades\Route;

// --- ROUTES PUBLIQUES ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/quizzes', [QuizController::class, 'index']);
Route::get('/quizzes/{id}', [QuizController::class, 'show']);
Route::post('/quizzes/{id}/submit', [QuizController::class, 'submit']);
Route::post('/ai/generate', [AiQuizController::class, 'generate']);

// La route JOIN est publique (un joueur n'a pas besoin de compte)
Route::post('/game/join', [GameSessionController::class, 'join']);

// --- ROUTES PROTÉGÉES (Il faut être connecté) ---
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Quiz
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::post('/quizzes/{quizId}/questions', [QuizController::class, 'addQuestion']);
    
    // --- MODE LIVE (KAHOOT) ---
    Route::post('/game/create', [GameSessionController::class, 'create']);
    Route::post('/game/{id}/start', [GameSessionController::class, 'start']);
    Route::get('/game/{id}/players', [GameSessionController::class, 'players']);
    
    // ⭐ Nouvelles routes pour le jeu en direct
    Route::get('/game/{id}/state', [GameSessionController::class, 'getGameState']);
    Route::post('/game/{id}/answer', [GameSessionController::class, 'submitAnswer']);
    Route::post('/game/{id}/next', [GameSessionController::class, 'nextQuestion']);

    // ⭐ Espace d'apprentissage (Profs IA)
    Route::get('/tutors', [TutorController::class, 'index']);

    // ⭐ Chat avec les profs IA
    Route::get('/chat/{tutorId}', [ChatController::class, 'index']);
    Route::post('/chat/{tutorId}', [ChatController::class, 'send']);
    
    // ⭐ NOUVEAU : Route pour effacer la conversation
    Route::delete('/chat/{tutorId}', [ChatController::class, 'destroy']);
});