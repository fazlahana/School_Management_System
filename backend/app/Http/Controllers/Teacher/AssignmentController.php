<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Assignment;

class AssignmentController extends Controller
{
    public function index()
    {
        $teacher = Auth::user()->teacher;
        $assignments = Assignment::with(['subject', 'class'])
            ->where('teacher_id', $teacher->id)
            ->latest()
            ->get();
        return response()->json($assignments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:classes,id',
            'due_date' => 'required|date|after_or_equal:today',
            'total_marks' => 'required|integer',
        ]);

        $validated['teacher_id'] = Auth::user()->teacher->id;
        $assignment = Assignment::create($validated);
        
        return response()->json($assignment, 201);
    }

    public function update(Request $request, $id)
    {
        $assignment = Assignment::where('teacher_id', Auth::user()->teacher->id)->findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:classes,id',
            'due_date' => 'required|date',
            'total_marks' => 'required|integer',
        ]);

        $assignment->update($validated);
        return response()->json($assignment);
    }

    public function destroy($id)
    {
        $assignment = Assignment::where('teacher_id', Auth::user()->teacher->id)->findOrFail($id);
        $assignment->delete();
        return response()->json(null, 204);
    }

    public function getSubmissions($id)
    {
        $assignment = Assignment::where('teacher_id', Auth::user()->teacher->id)->findOrFail($id);
        
        // Get all students in the class and their submissions for this assignment
        $submissions = \App\Models\Student::with(['user', 'submissions' => function($q) use ($id) {
            $q->where('assignment_id', $id);
        }])->where('class_id', $assignment->class_id)->get();

        return response()->json([
            'assignment' => $assignment,
            'submissions' => $submissions
        ]);
    }

    public function gradeSubmission(Request $request, $id, $submissionId)
    {
        $request->validate([
            'marks_obtained' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
        ]);

        $submission = \App\Models\AssignmentSubmission::where('assignment_id', $id)
            ->findOrFail($submissionId);

        $submission->update([
            'marks_obtained' => $request->marks_obtained,
            'feedback' => $request->feedback,
            'status' => 'graded' // Update status to graded
        ]);

        return response()->json($submission);
    }
}
