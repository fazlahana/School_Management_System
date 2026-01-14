<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FeeStructure;
use App\Traits\Trackable;

class FeeStructureController extends Controller
{
    use Trackable;

    public function index()
    {
        return response()->json(FeeStructure::with('class')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'amount' => 'required|numeric',
            'class_id' => 'nullable|exists:classes,id',
            'frequency' => 'required|in:monthly,yearly,one_time',
            'description' => 'nullable|string',
        ]);

        $fee = FeeStructure::create($validated);
        $this->logActivity('created_fee_structure', $fee, null, $fee->toArray());

        // Automatically generate invoices for students
        $this->generateInvoicesForFeeStructure($fee);

        return response()->json($fee, 201);
    }

    public function update(Request $request, $id)
    {
        $fee = FeeStructure::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'amount' => 'sometimes|numeric',
            'class_id' => 'nullable|exists:classes,id',
            'frequency' => 'sometimes|in:monthly,yearly,one_time',
            'description' => 'nullable|string',
        ]);

        $oldData = $fee->toArray();
        $fee->update($validated);
        $this->logActivity('updated_fee_structure', $fee, $oldData, $fee->toArray());

        // Update existing unpaid invoices and generate new ones if needed
        $this->updateInvoicesForFeeStructure($fee);

        return response()->json($fee);
    }

    /**
     * Update existing unpaid invoices and generate new ones for the class
     */
    private function updateInvoicesForFeeStructure(FeeStructure $feeStructure)
    {
        // 1. Update existing pending/partial invoices to match new amount
        // Use fee_structure_id for exact matching, fallback to title for legacy/manual matches
        \App\Models\Invoice::where(function($query) use ($feeStructure) {
                $query->where('fee_structure_id', $feeStructure->id)
                      ->orWhere('title', $feeStructure->name); 
            })
            ->where('status', '!=', 'paid')
            ->whereHas('student', function($q) use ($feeStructure) {
                if ($feeStructure->class_id) {
                    $q->where('class_id', $feeStructure->class_id);
                }
            })
            ->update([
                'total_amount' => $feeStructure->amount,
                'due_amount' => \DB::raw($feeStructure->amount . ' - paid_amount'),
                'fee_structure_id' => $feeStructure->id // Ensure legacy ones get linked
            ]);
            
        // 2. Generate invoices for any students who might have been missed or added
        $this->generateInvoicesForFeeStructure($feeStructure);
    }

    /**
     * Generate invoices for all students in the class for this fee structure
     */
    private function generateInvoicesForFeeStructure(FeeStructure $feeStructure)
    {
        // If no class is specified, skip invoice generation
        if (!$feeStructure->class_id) {
            return;
        }

        // Get all students in the class
        $students = \App\Models\Student::where('class_id', $feeStructure->class_id)->get();

        $invoicesCreated = 0;
        $invoicesSkipped = 0;

        // Determine billing period
        $billingPeriod = $this->getBillingPeriod($feeStructure->frequency);

        foreach ($students as $student) {
            // Check if an invoice already exists for this student, fee structure, and billing period
            $existingInvoice = \App\Models\Invoice::where('student_id', $student->id)
                ->where(function($q) use ($feeStructure) {
                    $q->where('fee_structure_id', $feeStructure->id)
                      ->orWhere('title', $feeStructure->name);
                })
                ->where('billing_period', $billingPeriod)
                ->where('status', '!=', 'paid')
                ->first();

            if ($existingInvoice) {
                $invoicesSkipped++;
                continue;
            }

            // Calculate due date based on frequency
            $dueDate = $this->calculateDueDate($feeStructure->frequency);

            // Create invoice
            \App\Models\Invoice::create([
                'student_id' => $student->id,
                'invoice_number' => 'INV-' . strtoupper(uniqid()),
                'fee_structure_id' => $feeStructure->id, // Link to fee structure
                'title' => $feeStructure->name,
                'description' => $feeStructure->description ?? 'Fee for ' . $feeStructure->name,
                'total_amount' => $feeStructure->amount,
                'paid_amount' => 0,
                'due_amount' => $feeStructure->amount,
                'due_date' => $dueDate,
                'billing_period' => $billingPeriod,
                'status' => 'pending',
            ]);

            $invoicesCreated++;
        }

        \Log::info('Auto-generated invoices for fee structure', [
            'fee_structure_id' => $feeStructure->id,
            'fee_name' => $feeStructure->name,
            'class_id' => $feeStructure->class_id,
            'billing_period' => $billingPeriod,
            'invoices_created' => $invoicesCreated,
            'invoices_skipped' => $invoicesSkipped,
        ]);
    }

    private function getBillingPeriod($frequency)
    {
        $now = \Carbon\Carbon::now();
        
        switch ($frequency) {
            case 'monthly':
                return $now->format('Y-m'); // e.g., "2026-01"
            case 'yearly':
                return $now->format('Y'); // e.g., "2026"
            case 'one_time':
                return 'one-time-' . $now->format('Y-m-d');
            default:
                return $now->format('Y-m');
        }
    }

    private function calculateDueDate($frequency)
    {
        $now = \Carbon\Carbon::now();
        
        switch ($frequency) {
            case 'monthly':
                return $now->addMonth()->endOfMonth();
            case 'yearly':
                return $now->addYear()->endOfYear();
            case 'one_time':
                return $now->addDays(30);
            default:
                return $now->addMonth();
        }
    }

    public function destroy($id)
    {
        $fee = FeeStructure::findOrFail($id);
        $this->logActivity('deleted_fee_structure', $fee, $fee->toArray(), null);
        $fee->delete();
        return response()->json(null, 204);
    }
}
