<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;
use App\Models\Invoice;
use App\Models\Setting;

class PaymentReminderMail extends Mailable
{
     use Queueable, SerializesModels;

     public $invoice;

     public function __construct(Invoice $invoice)
     {
         $this->invoice = $invoice;
     }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(Setting::get('school_email', 'admin@school.com'), Setting::get('school_name', 'School System')),
            subject: 'Action Required: Payment Reminder for Invoice ' . $this->invoice->invoice_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment_reminder',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
