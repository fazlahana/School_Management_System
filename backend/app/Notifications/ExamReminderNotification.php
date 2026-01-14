<?php

namespace App\Notifications;

use App\Models\Exam;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExamReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $exam;
    public $role;

    /**
     * Create a new notification instance.
     */
    public function __construct(Exam $exam, $role)
    {
        $this->exam = $exam;
        $this->role = $role;
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
        $subject = "Exam Reminder: " . $this->exam->title;
        $url = config('app.frontend_url', 'http://localhost:3000') . '/dashboard';

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('This is a reminder that you have an upcoming exam.')
            ->line('**Exam:** ' . $this->exam->title)
            ->line('**Subject:** ' . $this->exam->subject->name)
            ->line('**Date:** ' . $this->exam->exam_date->format('l, F j, Y'))
            ->line('**Time:** ' . $this->exam->start_time . ' - ' . $this->exam->end_time)
            ->action('View Dashboard', $url)
            ->line('Good luck with your preparation!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'exam_id' => $this->exam->id,
            'title' => 'Upcoming Exam Reminder',
            'message' => "You have an exam for {$this->exam->subject->name} scheduled for tomorrow.",
            'exam_title' => $this->exam->title,
            'exam_date' => $this->exam->exam_date->toDateTimeString(),
            'type' => 'exam_reminder'
        ];
    }
}

