<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_tutors', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ex: Alex Code
            $table->string('subject'); // Ex: Informatique
            $table->string('avatar')->nullable(); // Pour l'image/emoji plus tard
            $table->text('system_prompt'); // Les règles strictes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_tutors');
    }
};