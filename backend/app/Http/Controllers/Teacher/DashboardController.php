<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return response()->json(['error' => 'Teacher profile not found'], 404);
        }
        $teacher->load(['user', 'subjects', 'classes']);
        
        $classIds = $teacher->classes->pluck('id');
        $subjectIds = $teacher->subjects->pluck('id');

        $totalStudents = \App\Models\Student::whereIn('class_id', $classIds)->count();
        $upcomingExams = \App\Models\Exam::with(['subject', 'class'])
            ->whereIn('class_id', $classIds)
            ->where('exam_date', '>=', now())
            ->orderBy('exam_date', 'asc')
            ->take(5)
            ->get();

        $activeAssignments = \App\Models\Assignment::where('teacher_id', $teacher->id)
            ->where('due_date', '>=', now())
            ->count();

        return response()->json([
            'stats' => [
                'total_students' => $totalStudents,
                'total_classes' => $teacher->classes->count(),
                'total_subjects' => $teacher->subjects->count(),
                'active_assignments' => $activeAssignments,
            ],
            'upcoming_exams' => $upcomingExams,
            'my_subjects' => $teacher->subjects,
            'recent_assignments' => \App\Models\Assignment::where('teacher_id', $teacher->id)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
        ]);
    }
}
