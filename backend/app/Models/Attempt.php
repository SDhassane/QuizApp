<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attempt extends Model
{
    protected $fillable = ['user_id', 'quiz_id', 'score', 'total_points', 'started_at', 'finished_at'];

    public function answers()
    {
        return $this->hasMany(AttemptAnswer::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}