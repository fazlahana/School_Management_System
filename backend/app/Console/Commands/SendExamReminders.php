<?php

namespace App\Console\Commands;

use App\Models\Exam;
use App\Models\User;
use App\Notifications\ExamReminderNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class SendExamReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exams:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send notifications to students and teachers 1 day before an exam';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tomorrow = Carbon::tomorrow()->toDateString();
        
        $this->info("Checking for exams on: $tomorrow");

        // Find exams scheduled for tomorrow
        $exams = Exam::with(['subject', 'class.students.user', 'teacher.user'])
            ->whereDate('exam_date', $tomorrow)
            ->get();

        if ($exams->isEmpty()) {
            $this->info("No exams found for tomorrow.");
            return;
        }

        foreach ($exams as $exam) {
            $this->info("Processing exam: {$exam->title}");

            // 1. Get Students
            $students = $exam->class->students;
            $studentUsers = $students->map(fn($student) => $student->user)->filter();

            if ($studentUsers->isNotEmpty()) {
                Notification::send($studentUsers, new ExamReminderNotification($exam, 'student'));
                $this->line(" - Sent to " . $studentUsers->count() . " students.");
            }

            // 2. Get Teacher
            $teacherUser = $exam->teacher ? $exam->teacher->user : null;
            if ($teacherUser) {
                $teacherUser->notify(new ExamReminderNotification($exam, 'teacher'));
                $this->line(" - Sent to teacher: {$teacherUser->name}");
            }
        }

        $this->info("All reminders sent successfully!");
    }
}

