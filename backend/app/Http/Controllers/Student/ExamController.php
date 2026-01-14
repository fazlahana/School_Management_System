<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Support\Facades\Auth;

class ExamController extends Controller
{
    public function index()
    {
        $student = Auth::user()->student;
        $exams = Exam::with(['subject', 'results' => function($q) use ($student) {
            $q->where('student_id', $student->id);
        }])
            ->where('class_id', $student->class_id)
            ->where('exam_date', '>=', now()->subDays(30)) // Show exams from last 30 days and future
            ->orderBy('exam_date', 'desc')
            ->get();
            
        return response()->json($exams);
    }
}
