<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = [
        'game_session_id', 'user_id', 'nickname', 'score'
    ];

    public function gameSession()
    {
        return $this->belongsTo(GameSession::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}