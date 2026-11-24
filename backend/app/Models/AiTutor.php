<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiTutor extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'subject', 'avatar', 'system_prompt'];
}