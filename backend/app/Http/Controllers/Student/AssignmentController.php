<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssignmentController extends Controller
{
    public function index()
    {
        $student = Auth::user()->student;
        $assignments = Assignment::with(['subject', 'teacher.user'])
            ->where('class_id', $student->class_id)
            ->latest()
            ->get();
            
        // Map submissions status
        $submissions = AssignmentSubmission::where('student_id', $student->id)->get()->keyBy('assignment_id');
        
        $data = $assignments->map(function($a) use ($submissions) {
            $sub = $submissions->get($a->id);
            $status = 'pending';
            if ($sub) {
                $status = ($sub->status === 'graded') ? 'graded' : 'submitted';
            } elseif (now() > $a->due_date) {
                $status = 'overdue';
            }
            
            return [
                ...$a->toArray(),
                'status' => $status,
                'submission' => $sub,
            ];
        });
            
        return response()->json($data);
    }

    public function submit(Request $request, $id)
    {
        $request->validate([
            'submission_text' => 'required|string',
        ]);

        $student = Auth::user()->student;
        
        $submission = AssignmentSubmission::updateOrCreate(
            ['assignment_id' => $id, 'student_id' => $student->id],
            [
                'submission_text' => $request->submission_text,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]
        );

        // Notify teacher
        $assignment = Assignment::with('teacher.user')->findOrFail($id);
        if ($assignment->teacher && $assignment->teacher->user) {
            $notificationData = [
                'title' => 'New Assignment Submission',
                'message' => "{$student->first_name} {$student->last_name} has submitted the assignment: {$assignment->title}",
                'link' => "/teacher/assignments/{$id}/submissions",
                'type' => 'info'
            ];
            $assignment->teacher->user->notify(new \App\Notifications\SystemNotification($notificationData));
        }

        return response()->json($submission);
    }
}
