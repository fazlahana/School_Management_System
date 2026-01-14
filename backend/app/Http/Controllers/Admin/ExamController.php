<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;

class ExamController extends Controller
{
    public function index()
    {
        $exams = Exam::with(['subject', 'class', 'teacher.user'])->paginate(10);
        return response()->json($exams);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:classes,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'exam_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'location' => 'nullable|string',
            'total_marks' => 'required|integer',
            'passing_marks' => 'required|integer',
        ]);

        try {
            $exam = Exam::create($validated);
            
            // Notify students in the class
            try {
                $students = \App\Models\Student::where('class_id', $validated['class_id'])->with('user')->get();
                
                foreach ($students as $student) {
                    if ($student->user && $student->user->email) {
                        // Send System Notification
                        $student->user->notify(new \App\Notifications\SystemNotification([
                            'title' => 'New Exam Scheduled',
                            'message' => "A new exam for " . ($exam->subject->name ?? 'Subject') . " has been scheduled for " . \Carbon\Carbon::parse($exam->exam_date)->format('M d, Y'),
                            'link' => '/student/exams',
                            'type' => 'info'
                        ]));

                        // Send Email Notification
                        \Illuminate\Support\Facades\Mail::to($student->user->email)->send(new \App\Mail\ExamScheduledMail($exam, 'scheduled'));
                    }
                }
            } catch (\Exception $navEx) {
                \Illuminate\Support\Facades\Log::error('Exam notification failed: ' . $navEx->getMessage());
            }

            return response()->json($exam->load(['subject', 'class', 'teacher.user']), 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to schedule exam',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        return response()->json(Exam::with(['subject', 'class', 'teacher.user'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:classes,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'exam_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'location' => 'nullable|string',
            'total_marks' => 'required|integer',
            'passing_marks' => 'required|integer',
        ]);

        try {
            $exam->update($validated);

            // Notify students in the class
            try {
                $students = \App\Models\Student::where('class_id', $validated['class_id'])->with('user')->get();
                foreach ($students as $student) {
                    if ($student->user && $student->user->email) {
                        \Illuminate\Support\Facades\Mail::to($student->user->email)->send(new \App\Mail\ExamScheduledMail($exam, 'updated'));
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Exam update notification failed: ' . $e->getMessage());
            }

            return response()->json($exam->load(['subject', 'class', 'teacher.user']));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update exam',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        Exam::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
