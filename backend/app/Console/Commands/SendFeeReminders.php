<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Notifications\FeeReminderNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendFeeReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fees:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send notifications for pending and overdue fee invoices';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        
        // Find invoices that are:
        // 1. Pending or Partial
        // 2. Due today, or due in 3 days, or overdue
        $invoices = Invoice::with('student.user')
            ->whereIn('status', ['pending', 'partial'])
            ->where(function ($query) use ($today) {
                $query->whereDate('due_date', $today) // Due today
                    ->orWhereDate('due_date', $today->copy()->addDays(3)) // Due in 3 days
                    ->orWhereDate('due_date', '<', $today); // Overdue
            })
            ->get();

        if ($invoices->isEmpty()) {
            $this->info("No pending invoices requiring a reminder today.");
            return;
        }

        foreach ($invoices as $invoice) {
            $user = $invoice->student ? $invoice->student->user : null;
            
            if ($user) {
                $user->notify(new FeeReminderNotification($invoice));
                $this->info("Sent reminder for invoice {$invoice->invoice_number} to {$user->name}");
            }
        }

        $this->info("Fee reminders sent successfully!");
    }
}

