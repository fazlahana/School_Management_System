<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Invoice;
use App\Models\ClassModel;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class ClassWisePaymentController extends Controller
{
    /**
     * Get students with their formatted invoice data for a specific class
     */
    public function index(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'month' => 'nullable|date_format:Y-m' // Optional filter by month
        ]);

        $classId = $request->class_id;
        
        $students = Student::with(['user', 'invoices' => function($q) use ($request) {
            $q->with('payments') // Eager load payments
              ->where('status', '!=', 'paid')
              ->when($request->month, function($query, $month) {
                  $query->where('billing_period', $month);
              });
        }])
        ->where('class_id', $classId)
        ->get()
        ->map(function($student) {
            return [
                'id' => $student->id,
                'name' => $student->user->name,
                'admission_number' => $student->admission_number,
                'invoices' => $student->invoices->map(function($invoice) {
                    return [
                        'id' => $invoice->id,
                        'title' => $invoice->title,
                        'invoice_number' => $invoice->invoice_number,
                        'total_amount' => $invoice->total_amount,
                        'paid_amount' => $invoice->paid_amount,
                        'due_amount' => $invoice->due_amount,
                        'status' => $invoice->status,
                        'due_date' => $invoice->due_date,
                        'payments' => $invoice->payments->map(function($p) {
                            return ['id' => $p->id, 'amount' => $p->amount, 'date' => $p->payment_date];
                        })
                    ];
                })
            ];
        });

        return response()->json($students);
    }

    /**
     * Record a payment (full or partial) for a specific invoice
     */
    public function recordPayment(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string', // cash, bank_transfer, online
            'remarks' => 'nullable|string'
        ]);

        return DB::transaction(function() use ($validated) {
            $invoice = Invoice::findOrFail($validated['invoice_id']);

            // Validate overpayment
            if ($invoice->paid_amount + $validated['amount'] > $invoice->total_amount) {
                return response()->json(['error' => 'Payment amount exceeds due amount.'], 422);
            }

            // Create Payment Record
            $payment = Payment::create([
                'student_id' => $invoice->student_id,
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'type' => 'fee_payment', 
                'status' => 'completed',
                'description' => $validated['remarks'] ?? 'Payment for invoice ' . $invoice->invoice_number,
                // Assuming you might link payment to invoice later or via description for now
                // Ideally, establish a relationship in Payment model: $table->foreignId('invoice_id')...
            ]);

            // Update Invoice Status
            $invoice->paid_amount += $validated['amount'];
            $invoice->due_amount = $invoice->total_amount - $invoice->paid_amount;

            if ($invoice->due_amount <= 0) {
                $invoice->status = 'paid';
                $invoice->paid_at = now();
            } else {
                $invoice->status = 'partial';
            }
            
            $invoice->save();

            return response()->json([
                'message' => 'Payment recorded successfully',
                'invoice' => $invoice,
                'payment' => $payment
            ]);
        });
    }
}
