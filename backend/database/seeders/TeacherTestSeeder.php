<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Teacher;
use App\Models\ClassModel;
use App\Models\Subject;
use Illuminate\Support\Facades\Hash;

class TeacherTestSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Teacher User
        $user = User::firstOrCreate(
            ['email' => 'teacher@school.com'],
            [
                'name' => 'Professor Smith',
                'password' => Hash::make('password123'),
                'role' => 'teacher',
                'status' => 'active'
            ]
        );

        // 2. Create Teacher Profile
        $teacher = Teacher::firstOrCreate(
            ['user_id' => $user->id],
            [
                'employee_code' => 'TEA2025001',
                'specialization' => 'Sciences',
                'join_date' => '2020-01-01'
            ]
        );

        // 3. Create/Get Classes and Subjects
        $classA = ClassModel::firstOrCreate(['name' => 'Grade 10-A'], ['section' => 'A']);
        $classB = ClassModel::firstOrCreate(['name' => 'Grade 11-B'], ['section' => 'B']);
        
        $math = Subject::where('code', 'MATH10')->first() ?: Subject::create(['name' => 'Mathematics', 'code' => 'MATH10']);
        $physics = Subject::where('code', 'PHYS10')->first() ?: Subject::create(['name' => 'Physics', 'code' => 'PHYS10']);

        // 4. Assign Classes to Teacher (if not already)
        $classA->teacher_id = $teacher->id;
        $classA->save();
        $classB->teacher_id = $teacher->id;
        $classB->save();

        // 5. Assign Subjects to Teacher
        if (!$teacher->subjects()->where('subjects.id', $math->id)->exists()) {
            $teacher->subjects()->attach($math->id);
        }
        if (!$teacher->subjects()->where('subjects.id', $physics->id)->exists()) {
            $teacher->subjects()->attach($physics->id);
        }
    }
}
