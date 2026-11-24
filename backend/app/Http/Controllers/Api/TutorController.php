<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiTutor;

class TutorController extends Controller
{
    public function index()
    {
        // On renvoie uniquement les infos publiques des profs (pas le system_prompt pour des raisons de sécurité)
        $tutors = AiTutor::select('id', 'name', 'subject', 'avatar')->get();
        
        return response()->json($tutors);
    }
}