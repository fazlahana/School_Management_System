<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $student = $user->student->load(['user', 'class.subjects', 'documents']);
        
        if (!$student) {
            return response()->json(['error' => 'Student record not found'], 404);
        }

        // Upcoming Exams
        $upcomingExams = \App\Models\Exam::with(['subject'])
            ->where('class_id', $student->class_id)
            ->where('exam_date', '>=', now())
            ->orderBy('exam_date', 'asc')
            ->take(5)
            ->get();

        // Recent Exam Results
        $recentResults = \App\Models\ExamResult::with(['exam.subject'])
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Payments/Fees History (Invoices)
        $invoices = \App\Models\Invoice::with('payments')
            ->where('student_id', $student->id)
            ->orderBy('due_date', 'desc')
            ->get();

        $totalDue = $invoices->sum('due_amount');

        // Notifications
        $notifications = $user->notifications()
            ->take(10)
            ->get();

        return response()->json([
            'student' => $student,
            'stats' => [
                'my_class' => $student->class ? $student->class->name : 'N/A',
                'upcoming_exams' => $upcomingExams->count(),
                'pending_fees' => $totalDue,
                'total_results' => \App\Models\ExamResult::where('student_id', $student->id)->count(),
            ],
            'upcoming_exams' => $upcomingExams,
            'recent_results' => $recentResults,
            'my_subjects' => $student->class ? $student->class->subjects : [],
            'invoices' => $invoices,
            'notifications' => $notifications,
            'documents' => $student->documents,
        ]);
    }
}
