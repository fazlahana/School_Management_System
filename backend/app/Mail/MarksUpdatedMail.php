<?php

namespace App\Mail;

use App\Models\ExamResult;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MarksUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $result;

    /**
     * Create a new message instance.
     */
    public function __construct(ExamResult $result)
    {
        $this->result = $result->load(['exam.subject', 'student.user']);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Exam Results Published: ' . $this->result->exam->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.marks_updated',
        );
    }
}
