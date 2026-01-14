<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ExamResult;
use Illuminate\Support\Facades\Auth;

class ResultController extends Controller
{
    public function index()
    {
        $student = Auth::user()->student;
        $results = ExamResult::with(['exam.subject'])
            ->where('student_id', $student->id)
            ->whereHas('exam', function($q) {
                $q->where('is_published', true);
            })
            ->latest()
            ->get();
            
        return response()->json($results);
    }
}
