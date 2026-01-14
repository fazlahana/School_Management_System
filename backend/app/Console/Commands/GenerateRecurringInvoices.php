<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\Invoice;
use Carbon\Carbon;

class GenerateRecurringInvoices extends Command
{
    protected $signature = 'invoices:generate-recurring';
    protected $description = 'Generate recurring invoices based on fee structures';

    public function handle()
    {
        $this->info('Starting recurring invoice generation...');

        // Get all active fee structures
        $feeStructures = FeeStructure::all();
        
        $totalCreated = 0;
        $totalSkipped = 0;

        foreach ($feeStructures as $feeStructure) {
            $result = $this->generateInvoicesForFeeStructure($feeStructure);
            $totalCreated += $result['created'];
            $totalSkipped += $result['skipped'];
        }

        $this->info("Invoice generation complete!");
        $this->info("Created: {$totalCreated} invoices");
        $this->info("Skipped: {$totalSkipped} invoices (already exist)");

        return 0;
    }

    private function generateInvoicesForFeeStructure(FeeStructure $feeStructure)
    {
        $created = 0;
        $skipped = 0;

        // If no class is specified, skip
        if (!$feeStructure->class_id) {
            return ['created' => 0, 'skipped' => 0];
        }

        // Get all students in the class
        $students = Student::where('class_id', $feeStructure->class_id)->get();

        // Determine billing period based on frequency
        $billingPeriod = $this->getBillingPeriod($feeStructure->frequency);

        foreach ($students as $student) {
            // Check if invoice already exists for this billing period
            $existingInvoice = Invoice::where('student_id', $student->id)
                ->where(function($q) use ($feeStructure) {
                    $q->where('fee_structure_id', $feeStructure->id)
                      ->orWhere('title', $feeStructure->name);
                })
                ->where('billing_period', $billingPeriod)
                ->where('status', '!=', 'paid')
                ->first();

            if ($existingInvoice) {
                $skipped++;
                continue;
            }

            // Calculate due date
            $dueDate = $this->calculateDueDate($feeStructure->frequency);

            // Create invoice
            Invoice::create([
                'student_id' => $student->id,
                'invoice_number' => $this->generateInvoiceNumber(),
                'fee_structure_id' => $feeStructure->id, // Link to fee structure
                'title' => $feeStructure->name,
                'description' => $feeStructure->description ?? "Fee for {$feeStructure->name}",
                'total_amount' => $feeStructure->amount,
                'paid_amount' => 0,
                'due_amount' => $feeStructure->amount,
                'due_date' => $dueDate,
                'billing_period' => $billingPeriod,
                'status' => 'pending',
            ]);

            $created++;
        }

        return ['created' => $created, 'skipped' => $skipped];
    }

    private function getBillingPeriod($frequency)
    {
        $now = Carbon::now();
        
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
        $now = Carbon::now();
        
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

    private function generateInvoiceNumber()
    {
        return 'INV-' . strtoupper(uniqid());
    }
}
