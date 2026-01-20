<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class PaymentAnalyticsController extends Controller
{
    public function getSummary()
    {
        $totalRevenue = Payment::sum('amount');
        $totalOutstanding = Invoice::sum('due_amount');
        $overdueCount = Invoice::where('status', '!=', 'paid')
            ->where('due_date', '<', now())
            ->count();

        // Monthly trends (Last 6 months)
        $monthlyRevenue = Payment::select(
            DB::raw('SUM(amount) as total'),
            DB::raw("DATE_FORMAT(payment_date, '%b %Y') as month")
        )
        ->groupBy('month')
        ->orderBy('payment_date', 'asc')
        ->take(6)
        ->get();

        // Paid vs Pending ratio
        $statusBreakdown = Invoice::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_outstanding' => $totalOutstanding,
                'overdue_invoices' => $overdueCount,
            ],
            'monthly_revenue' => $monthlyRevenue,
            'status_breakdown' => $statusBreakdown,
        ]);
    }

    public function getOverdueStudents(Request $request)
    {
        $overdue = Invoice::with('student.user')
            ->where('status', '!=', 'paid')
            ->where('due_date', '<', now())
            ->latest()
            ->paginate($request->per_page ?? 15);
            
        return response()->json($overdue);
    }
}
