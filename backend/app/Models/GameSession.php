<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameSession extends Model
{
    protected $fillable = [
        'pin', 'host_id', 'quiz_id', 'status', 'current_question_index'
    ];

    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    // Nouvelle relation : la session a plusieurs joueurs
    public function players()
    {
        return $this->hasMany(Player::class);
    }
}