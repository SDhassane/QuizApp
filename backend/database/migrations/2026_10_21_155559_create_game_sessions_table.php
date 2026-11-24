<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('pin', 6)->unique(); // Le code à 6 chiffres
            $table->foreignId('host_id')->constrained('users')->onDelete('cascade'); // Le créateur
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade'); // Le quiz choisi
            $table->enum('status', ['waiting', 'playing', 'finished'])->default('waiting'); // État de la partie
            $table->integer('current_question_index')->default(0); // Question actuelle
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};