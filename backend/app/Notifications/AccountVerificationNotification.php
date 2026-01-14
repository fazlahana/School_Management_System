<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $otp;

    /**
     * Create a new notification instance.
     */
    public function __construct($otp)
    {
        $this->otp = $otp;
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
        return (new MailMessage)
            ->subject('Verify Your Account')
            ->greeting('Welcome to Our School Management System!')
            ->line('Thank you for registering. To activate your account, please use the following One-Time Password (OTP):')
            ->line("**{$this->otp}**")
            ->line('This code is valid for 10 minutes.')
            ->line('If you did not register for an account, please ignore this email.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Account Verification',
            'message' => "Your account verification OTP is {$this->otp}.",
            'type' => 'account_verification'
        ];
    }
}

