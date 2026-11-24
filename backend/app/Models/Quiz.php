<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $fillable = ['category_id', 'user_id', 'title', 'description', 'difficulty', 'time_limit', 'is_published', 'image'];

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function attempts()
    {
        return $this->hasMany(Attempt::class);
    }
}