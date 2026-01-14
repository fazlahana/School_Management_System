<?php

namespace App\Mail;

use App\Models\Exam;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ExamScheduledMail extends Mailable
{
    use Queueable, SerializesModels;

    public $exam;
    public $type; // 'scheduled' or 'updated'

    /**
     * Create a new message instance.
     */
    public function __construct(Exam $exam, $type = 'scheduled')
    {
        $this->exam = $exam->load('subject', 'class');
        $this->type = $type;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->type === 'scheduled' 
            ? 'New Exam Scheduled: ' . $this->exam->title 
            : 'Exam Schedule Updated: ' . $this->exam->title;

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.exam_scheduled',
        );
    }
}
