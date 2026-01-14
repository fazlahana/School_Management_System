<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendOTPNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $otp;
    public $type;

    /**
     * Create a new notification instance.
     */
    public function __construct($otp, $type)
    {
        $this->otp = $otp;
        $this->type = $type;
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
        $typeLabel = str_replace('_', ' ', ucfirst($this->type));

        return (new MailMessage)
            ->subject($typeLabel . ' OTP Verification')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line("You are receiving this email because we received a request for **{$typeLabel}**.")
            ->line('Your One-Time Password (OTP) is:')
            ->line("**{$this->otp}**")
            ->line('This OTP is valid for 10 minutes.')
            ->line('If you did not request this, no further action is required.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'OTP Verification',
            'message' => "Your OTP for " . str_replace('_', ' ', $this->type) . " is {$this->otp}.",
            'type' => 'otp_notification'
        ];
    }
}

