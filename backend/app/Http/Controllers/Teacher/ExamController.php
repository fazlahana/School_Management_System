<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Student;

class ExamController extends Controller
{
    public function index()
    {
        $teacher = Auth::user()->teacher;
        $classIds = $teacher->classes->pluck('id');
        
        $exams = Exam::with(['subject', 'class'])
            ->whereIn('class_id', $classIds)
            ->latest()
            ->get();
            
        return response()->json($exams);
    }

    public function getStudentsForMarking($examId)
    {
        $exam = Exam::findOrFail($examId);
        $students = Student::with(['user', 'results' => function($q) use ($examId) {
            $q->where('exam_id', $examId);
        }])->where('class_id', $exam->class_id)->get();
        
        return response()->json([
            'exam' => $exam,
            'students' => $students
        ]);
    }

    public function storeMarks(Request $request, $examId)
    {
        $request->validate([
            'marks' => 'required|array',
            'marks.*.student_id' => 'required|exists:students,id',
            'marks.*.marks_obtained' => 'required|numeric|min:0',
            'marks.*.remarks' => 'nullable|string',
        ]);

        $exam = Exam::findOrFail($examId);

        foreach ($request->marks as $markData) {
            $result = ExamResult::updateOrCreate(
                ['exam_id' => $examId, 'student_id' => $markData['student_id']],
                [
                    'marks_obtained' => $markData['marks_obtained'],
                    'grade' => $this->calculateGrade($markData['marks_obtained'], $exam->total_marks),
                    'remarks' => $markData['remarks'] ?? null,
                ]
            );

            // Send Email Notification to each student
            try {
                $student = Student::with('user')->find($markData['student_id']);
                if ($student->user && $student->user->email) {
                    \Illuminate\Support\Facades\Mail::to($student->user->email)->send(new \App\Mail\MarksUpdatedMail($result));
                }
            } catch (\Exception $mailEx) {
                \Illuminate\Support\Facades\Log::error('Marks update email failed: ' . $mailEx->getMessage());
            }
        }

        // Set the exam as published when marks are recorded
        $exam->update([
            'is_published' => true,
            'published_at' => now(),
        ]);

        return response()->json(['message' => 'Marks updated and published successfully']);
    }

    private function calculateGrade($marks, $total)
    {
        if (!$total || $total <= 0) return 'N/A';
        $percentage = ($marks / $total) * 100;
        if ($percentage >= 90) return 'A+';
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B';
        if ($percentage >= 60) return 'C';
        if ($percentage >= 50) return 'D';
        return 'F';
    }
}
