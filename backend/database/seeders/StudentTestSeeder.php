<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;
use App\Models\ClassModel;
use App\Models\Subject;
use App\Models\Payment;
use App\Models\Notification;
use App\Models\Exam;
use App\Models\ExamResult;
use Illuminate\Support\Facades\Hash;

class StudentTestSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a Class
        $class = ClassModel::firstOrCreate(['name' => 'Grade 10-A'], ['section' => 'A']);

        // 2. Create Subjects and link to Class
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MATH10'],
            ['name' => 'Physics', 'code' => 'PHYS10'],
            ['name' => 'English Literature', 'code' => 'ENG10'],
        ];

        foreach ($subjects as $sData) {
            $subject = Subject::firstOrCreate(['code' => $sData['code']], $sData);
            if (!$class->subjects()->where('subjects.id', $subject->id)->exists()) {
                $class->subjects()->attach($subject->id);
            }
        }

        // 3. Create Student User
        $user = User::firstOrCreate(
            ['email' => 'student@school.com'],
            [
                'name' => 'Alex Johnson',
                'password' => Hash::make('password123'),
                'role' => 'student',
                'status' => 'active'
            ]
        );

        // 4. Create Student Profile
        $student = Student::firstOrCreate(
            ['user_id' => $user->id],
            [
                'class_id' => $class->id,
                'student_code' => 'STU2025001',
                'phone' => '+1 234 567 890',
                'date_of_birth' => '2008-05-15',
                'gender' => 'male',
                'address' => '123 Academic Way, Education City'
            ]
        );

        // 5. Add some Payments
        Payment::create([
            'student_id' => $student->id,
            'type' => 'Admission Fee',
            'amount' => 500,
            'payment_date' => now()->subMonths(2),
            'status' => 'paid'
        ]);

        Payment::create([
            'student_id' => $student->id,
            'type' => 'Monthly Tuition - Dec',
            'amount' => 200,
            'payment_date' => now()->subDays(5),
            'status' => 'pending'
        ]);

        // 6. Add some Notifications
        $user->notify(new \App\Notifications\SystemNotification([
            'title' => 'Welcome to EduSpire',
            'message' => 'Your student portal is now active. Check your exam schedule.',
            'type' => 'info'
        ]));

        $user->notify(new \App\Notifications\SystemNotification([
            'title' => 'Exam Schedule Updated',
            'message' => 'The Mid-term exams for Mathematics have been moved to next Monday.',
            'type' => 'warning'
        ]));

        // 7. Add an Exam and Result
        $math = Subject::where('code', 'MATH10')->first();
        $exam = Exam::create([
            'title' => 'Mathematics Mid-term',
            'subject_id' => $math->id,
            'class_id' => $class->id,
            'exam_date' => now()->addDays(7),
            'start_time' => '09:00:00',
            'end_time' => '12:00:00',
            'location' => 'Block A, Hall 1',
            'total_marks' => 100
        ]);

        ExamResult::create([
            'exam_id' => $exam->id,
            'student_id' => $student->id,
            'marks_obtained' => 85,
            'grade' => 'A',
            'remarks' => 'Excellent performance in Algebra.'
        ]);
    }
}
