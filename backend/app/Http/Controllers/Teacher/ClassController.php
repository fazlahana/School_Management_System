<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ClassModel;
use App\Models\Student;

class ClassController extends Controller
{
    public function index()
    {
        $teacher = Auth::user()->teacher;
        $classes = $teacher->classes()->withCount('students')->get();
        return response()->json($classes);
    }

    public function show($id)
    {
        $teacher = Auth::user()->teacher;
        $class = $teacher->classes()->with(['students.user', 'subjects'])->findOrFail($id);
        return response()->json($class);
    }

    public function subjects()
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return response()->json([]);
        }

        // Get subjects assigned directly to teacher
        $teacherSubjects = $teacher->subjects;

        // Also get subjects from classes assigned to teacher
        $classSubjects = \App\Models\Subject::whereHas('classes', function($q) use ($teacher) {
            $q->whereIn('classes.id', $teacher->classes->pluck('id'));
        })->get();

        $allSubjects = $teacherSubjects->merge($classSubjects)->unique('id')->values();

        return response()->json($allSubjects);
    }
}
