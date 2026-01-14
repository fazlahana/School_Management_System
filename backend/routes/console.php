<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule recurring invoice generation
Schedule::command('invoices:generate-recurring')
    ->monthlyOn(1, '00:00')
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Log::info('Recurring invoices generated successfully');
    })
    ->onFailure(function () {
        \Log::error('Failed to generate recurring invoices');
    });
// Schedule exam reminders to run daily
Schedule::command('exams:send-reminders')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Log::info('Exam reminders sent successfully');
    })
    ->onFailure(function () {
        \Log::error('Failed to send exam reminders');
    });
// Schedule fee reminders to run daily
Schedule::command('fees:send-reminders')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Log::info('Fee reminders sent successfully');
    })
    ->onFailure(function () {
        \Log::error('Failed to send fee reminders');
    });
