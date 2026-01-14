<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FeeReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $invoice;

    /**
     * Create a new notification instance.
     */
    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = config('app.frontend_url', 'http://localhost:3000') . '/dashboard/payments';

        return (new MailMessage)
            ->subject('Fee Payment Reminder: ' . $this->invoice->invoice_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('This is a reminder regarding your pending fee payment.')
            ->line('**Invoice:** ' . $this->invoice->invoice_number)
            ->line('**Amount Due:** ' . number_format($this->invoice->due_amount, 2))
            ->line('**Due Date:** ' . \Carbon\Carbon::parse($this->invoice->due_date)->format('M d, Y'))
            ->action('Make Payment', $url)
            ->line('Please ignore this if you have already made the payment.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'invoice_id' => $this->invoice->id,
            'title' => 'Fee Payment Reminder',
            'message' => "You have a pending payment of " . number_format($this->invoice->due_amount, 2) . " for invoice {$this->invoice->invoice_number}.",
            'due_date' => $this->invoice->due_date,
            'type' => 'fee_reminder'
        ];
    }
}

