<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Traits\Trackable;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    use Trackable;

    public function index(Request $request)
    {
        $query = Invoice::with(['student.user', 'payments']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('student.user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            })->orWhere('invoice_number', 'like', "%{$request->search}%");
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'title' => 'required|string',
            'total_amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        $validated['invoice_number'] = 'INV-' . strtoupper(Str::random(8));
        $validated['due_amount'] = $validated['total_amount'];
        $validated['status'] = 'pending';

        $invoice = Invoice::create($validated);
        $this->logActivity('created_invoice', $invoice, null, $invoice->toArray());

        return response()->json($invoice, 201);
    }

    public function addPayment(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:' . $invoice->due_amount,
            'payment_date' => 'required|date',
            'method' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $oldData = $invoice->toArray();

        // Create Payment Transaction
        $payment = Payment::create([
            'student_id' => $invoice->student_id,
            'invoice_id' => $invoice->id,
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'method' => $validated['method'],
            'type' => $invoice->title,
            'status' => 'paid',
            'description' => $validated['description'],
        ]);

        // Update Invoice
        $invoice->paid_amount += $validated['amount'];
        $invoice->due_amount -= $validated['amount'];
        
        if ($invoice->due_amount <= 0) {
            $invoice->status = 'paid';
        } else {
            $invoice->status = 'partial';
        }
        $invoice->save();

        // Generate Receipt PDF
        $pdf = Pdf::loadView('pdf.receipt', compact('payment'));
        $fileName = 'receipts/receipt_' . $payment->id . '_' . time() . '.pdf';
        Storage::disk('public')->put($fileName, $pdf->output());
        
        $payment->update(['receipt_path' => $fileName]);

        $this->logActivity('added_payment', $invoice, $oldData, $invoice->toArray());

        // Send Receipt Email
        try {
            if ($invoice->student->user->email) {
                \Illuminate\Support\Facades\Mail::to($invoice->student->user->email)->send(new \App\Mail\PaymentReceiptMail($payment));
            }
        } catch (\Exception $mailEx) {
            \Illuminate\Support\Facades\Log::error('Payment receipt email failed: ' . $mailEx->getMessage());
        }

        return response()->json([
            'message' => 'Payment recorded successfully',
            'payment' => $payment,
            'invoice' => $invoice,
            'receipt_url' => asset('storage/' . $fileName)
        ]);
    }

    public function downloadReceipt($paymentId)
    {
        $payment = Payment::with(['student.user', 'invoice'])->findOrFail($paymentId);
        if (!$payment->receipt_path || !Storage::disk('public')->exists($payment->receipt_path)) {
             // Regenerate if missing
             $pdf = Pdf::loadView('pdf.receipt', compact('payment'));
             $fileName = 'receipts/receipt_' . $payment->id . '_' . time() . '.pdf';
             Storage::disk('public')->put($fileName, $pdf->output());
             $payment->update(['receipt_path' => $fileName]);
        }
        return response()->download(storage_path('app/public/' . $payment->receipt_path));
    }

    public function sendReminder($id)
    {
        $invoice = Invoice::with(['student.user'])->findOrFail($id);
        
        \Illuminate\Support\Facades\Mail::to($invoice->student->user->email)
            ->send(new \App\Mail\PaymentReminderMail($invoice));

        $this->logActivity('sent_reminder', $invoice);

        return response()->json(['message' => 'Reminder sent successfully']);
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        
        // Optional: Block deletion if payments exist, or handle it.
        // For now, we allow deletion and assume payments might be orphaned or deleted via cascade.
        // Ideally, we should delete payments too.
        $invoice->payments()->delete(); // Delete associated payments
        
        $this->logActivity('deleted_invoice', $invoice, $invoice->toArray(), null);
        
        $invoice->delete();

        return response()->json(null, 204);
    }
}
