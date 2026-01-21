<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\ClassModel;
use App\Models\Subject;
use App\Models\Exam;
use App\Models\Payment;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $cacheKey = 'admin_dashboard_stats';
        
        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () {
            // Monthly trends for the last 6 months
            $months = [];
            for ($i = 5; $i >= 0; $i--) {
                $months[] = Carbon::now()->subMonths($i)->format('Y-m');
            }

            $invoiceTrends = \App\Models\Invoice::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total_amount) as total')
                ->where('created_at', '>=', Carbon::now()->subMonths(6))
                ->groupBy('month')
                ->pluck('total', 'month')
                ->toArray();

            $paymentTrends = Payment::selectRaw('DATE_FORMAT(payment_date, "%Y-%m") as month, SUM(amount) as total')
                ->where('status', 'paid')
                ->where('payment_date', '>=', Carbon::now()->subMonths(6))
                ->groupBy('month')
                ->pluck('total', 'month')
                ->toArray();

            $mergedTrends = [];
            foreach ($months as $month) {
                $date = Carbon::createFromFormat('Y-m', $month);
                $mergedTrends[] = [
                    'month' => $date->format('M Y'),
                    'invoiced' => (float)($invoiceTrends[$month] ?? 0),
                    'collected' => (float)($paymentTrends[$month] ?? 0),
                ];
            }

            // Upcoming exams (next 30 days)
            $upcomingExams = Exam::with(['subject', 'class'])
                ->where('exam_date', '>=', now()->toDateString())
                ->orderBy('exam_date', 'asc')
                ->take(5)
                ->get();

            return [
                'total_students' => Student::count(),
                'total_teachers' => Teacher::count(),
                'total_classes' => ClassModel::count(),
                'total_exams' => Exam::count(),
                'revenue_trends' => $mergedTrends,
                'upcoming_exams' => $upcomingExams,
                'recent_activity' => [],
            ];
        });

        return response()->json($data);
    }
}
