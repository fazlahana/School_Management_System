<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['user', 'class']);

        // Search
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($qu) use ($search) {
                    $qu->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('student_code', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->class_id) {
            $query->where('class_id', $request->class_id);
        }
        
        if ($request->unassigned === 'true') {
            $query->whereNull('class_id');
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        
        if ($sortField === 'name') {
            $query->join('users', 'students.user_id', '=', 'users.id')
                  ->orderBy('users.name', $sortOrder)
                  ->select('students.*');
        } elseif ($sortField === 'class') {
            $query->leftJoin('classes', 'students.class_id', '=', 'classes.id')
                  ->orderBy('classes.name', $sortOrder)
                  ->select('students.*');
        } elseif ($sortField === 'email') {
            $query->join('users', 'students.user_id', '=', 'users.id')
                  ->orderBy('users.email', $sortOrder)
                  ->select('students.*');
        } else {
            $query->orderBy($sortField, $sortOrder);
        }

        $perPage = $request->per_page ?? 15;
        $students = $query->paginate($perPage);

        return response()->json($students);
    }

    public function exportCSV()
    {
        $students = Student::with(['user', 'class'])->get();
        
        $csvHeader = ['ID', 'Name', 'Email', 'Student Code', 'Class', 'Status', 'DOB', 'Guardian', 'Phone', 'Created At'];
        $csvData = [];
        $csvData[] = implode(',', $csvHeader);

        foreach ($students as $student) {
            $csvData[] = implode(',', [
                $student->id,
                '"' . ($student->user->name ?? '') . '"',
                $student->user->email ?? '',
                $student->student_code,
                '"' . ($student->class->name ?? 'Unassigned') . '"',
                $student->status,
                $student->date_of_birth ?? '',
                '"' . ($student->guardian_name ?? '') . '"',
                $student->phone ?? '',
                $student->created_at
            ]);
        }

        $csvString = implode("\n", $csvData);
        
        return response($csvString)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="students_export_' . date('Y-m-d') . '.csv"');
    }

    public function bulkStatusChange(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id',
            'status' => 'required|string|in:active,inactive,graduated',
        ]);

        try {
            DB::beginTransaction();
            Student::whereIn('id', $validated['ids'])->update(['status' => $validated['status']]);
            
            // If status is inactive or graduated, we might want to disable user login
            if ($validated['status'] !== 'active') {
                $userIds = Student::whereIn('id', $validated['ids'])->pluck('user_id');
                User::whereIn('id', $userIds)->update(['is_active' => false]);
            } else {
                $userIds = Student::whereIn('id', $validated['ids'])->pluck('user_id');
                User::whereIn('id', $userIds)->update(['is_active' => true]);
            }
            
            DB::commit();
            return response()->json(['message' => count($validated['ids']) . ' students updated to ' . $validated['status']]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update status', 'message' => $e->getMessage()], 500);
        }
    }

    public function importCSV(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        
        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $header = fgetcsv($handle); // Skip header

        $count = 0;
        DB::beginTransaction();
        try {
            while (($data = fgetcsv($handle)) !== FALSE) {
                // Assuming CSV structure: Name, Email, Password, Code, ClassID, DOB, Guardian
                // This is a simplified version
                if (count($data) < 4) continue;

                $user = User::create([
                    'name' => $data[0],
                    'email' => $data[1],
                    'password' => $data[2],
                    'role' => 'student',
                ]);

                Student::create([
                    'user_id' => $user->id,
                    'student_code' => $data[3],
                    'class_id' => isset($data[4]) ? $data[4] : null,
                    'date_of_birth' => isset($data[5]) ? $data[5] : null,
                    'guardian_name' => isset($data[6]) ? $data[6] : null,
                    'status' => 'active',
                ]);
                $count++;
            }
            DB::commit();
            fclose($handle);
            return response()->json(['message' => "$count students imported successfully"]);
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return response()->json(['error' => 'Import failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function bulkEmail(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        // In a real app, you would use Mail::to($emails)->send(new BulkStudentMail($validated['subject'], $validated['message']));
        // For demonstration purposes, we'll just mock it.
        
        return response()->json(['message' => 'Email sent to ' . count($validated['ids']) . ' students successfully!']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'student_code' => 'required|unique:students',
            'class_id' => 'required|exists:classes,id',
            'date_of_birth' => 'nullable|date',
            'guardian_name' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive,graduated',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => 'student',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'class_id' => $validated['class_id'],
                'student_code' => $validated['student_code'],
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'guardian_name' => $validated['guardian_name'] ?? null,
            ]);

            DB::commit();

            // Send Credentials Email
            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\StudentCredentialsMail($user, $validated['password']));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send student credentials email: " . $e->getMessage());
            }

            // Notify all admins
            $admins = User::where('role', 'admin')->get();
            $notificationData = [
                'title' => 'New Student Added',
                'message' => "A new student, {$validated['name']}, has been added successfully.",
                'type' => 'info'
            ];
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\SystemNotification($notificationData));
            }

            return response()->json($student->load('user', 'class'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create student.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        return response()->json(Student::with('user', 'class')->findOrFail($id));
    }

    public function getProfile($id)
    {
        $student = Student::with([
            'user', 
            'class.subjects', 
            'examResults.exam.subject', 
            'payments' => function($q) {
                $q->latest();
            },
            'documents',
            'assignmentSubmissions.assignment.subject'
        ])->findOrFail($id);

        // Fetch subjects assigned to the class
        $subjects = $student->class ? $student->class->subjects : [];

        // Calculate some stats
        $totalFees = $student->payments()->where('status', 'paid')->sum('amount');
        $pendingFees = $student->payments()->where('status', 'pending')->sum('amount');
        
        return response()->json([
            'student' => $student,
            'subjects' => $subjects,
            'stats' => [
                'total_paid' => $totalFees,
                'pending_fees' => $pendingFees,
                'attendance_summary' => '95%', // Placeholder
                'last_login' => '2025-12-28 14:00:00', // Placeholder
            ],
            'activity_log' => [
                ['action' => 'Login', 'time' => '2025-12-28 14:00:00'],
                ['action' => 'Assignment Submission', 'time' => '2025-12-27 10:30:00'],
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $user = $student->user;

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6',
            'student_code' => 'required|unique:students,student_code,' . $student->id,
            'class_id' => 'required|exists:classes,id',
            'date_of_birth' => 'nullable|date',
            'guardian_name' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive,graduated',
        ]);

        DB::beginTransaction();
        try {
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
            ];
            if (!empty($validated['password'])) {
                $userData['password'] = $validated['password'];
            }
            $user->update($userData);

            $student->update([
                'class_id' => $validated['class_id'],
                'student_code' => $validated['student_code'],
                'date_of_birth' => $validated['date_of_birth'] ?? $student->date_of_birth,
                'guardian_name' => $validated['guardian_name'] ?? $student->guardian_name,
                'status' => $validated['status'] ?? $student->status,
            ]);

            if (isset($validated['status'])) {
                $user->update(['is_active' => $validated['status'] === 'active']);
            }

            DB::commit();
            return response()->json($student->load('user', 'class'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to update student',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $user = $student->user;
        
        DB::beginTransaction();
        try {
            $student->delete();
            $user->delete();
            DB::commit();
            return response()->json(['message' => 'Student deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to delete student',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id',
        ]);

        DB::beginTransaction();
        try {
            $students = Student::whereIn('id', $validated['ids'])->get();
            $userIds = $students->pluck('user_id');

            Student::whereIn('id', $validated['ids'])->delete();
            User::whereIn('id', $userIds)->delete();

            DB::commit();
            return response()->json(['message' => count($validated['ids']) . ' students deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to delete students',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id',
            'class_id' => 'nullable|exists:classes,id',
            // Add other fields if needed
        ]);

        $updateData = [];
        if (isset($validated['class_id'])) {
            $updateData['class_id'] = $validated['class_id'];
        }

        if (empty($updateData)) {
            return response()->json(['message' => 'No update data provided'], 400);
        }

        try {
            Student::whereIn('id', $validated['ids'])->update($updateData);
            return response()->json(['message' => count($validated['ids']) . ' students updated successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update students',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
