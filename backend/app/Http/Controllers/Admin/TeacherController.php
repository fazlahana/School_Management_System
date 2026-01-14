<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Teacher;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Subject;

class TeacherController extends Controller
{
    public function index()
    {
        $teachers = Teacher::with('user')->paginate(10);
        return response()->json($teachers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'employee_code' => 'required|unique:teachers',
            'specialization' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive,pending',
        ]);

        DB::beginTransaction();
        try {
            $verifyToken = \Illuminate\Support\Str::random(60);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => null,
                'role' => 'teacher',
                'status' => 'pending',
                'verify_token' => $verifyToken,
                'verify_token_expires_at' => now()->addHours(24),
            ]);

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'employee_code' => $validated['employee_code'],
                'specialization' => $validated['specialization'],
                'join_date' => now(),
            ]);

            DB::commit();

            // Send Activation Email
            $user->notify(new \App\Notifications\AccountActivationNotification($verifyToken));

            return response()->json($teacher->load('user'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create teacher',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        return response()->json(Teacher::with('user')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);
        $user = $teacher->user;

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6',
            'employee_code' => 'required|unique:teachers,employee_code,' . $teacher->id,
            'specialization' => 'nullable|string',
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

            $teacher->update([
                'employee_code' => $validated['employee_code'],
                'specialization' => $validated['specialization'],
            ]);

            DB::commit();
            return response()->json($teacher->load('user'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to update teacher',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);
        $user = $teacher->user;
        $teacher->delete();
        if ($user) {
            $user->delete();
        }
        return response()->json(['message' => 'Teacher deleted successfully']);
    }

    public function getSubjects($id)
    {
        $teacher = Teacher::with('subjects')->findOrFail($id);
        return response()->json($teacher->subjects);
    }

    public function assignSubjects(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);
        $validated = $request->validate([
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        $teacher->subjects()->sync($validated['subject_ids']);

        return response()->json([
            'message' => 'Subjects assigned successfully',
            'subjects' => $teacher->subjects()->get()
        ]);
    }
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:teachers,id',
        ]);

        DB::beginTransaction();
        try {
            $teachers = Teacher::whereIn('id', $validated['ids'])->get();
            $userIds = $teachers->pluck('user_id');

            Teacher::whereIn('id', $validated['ids'])->delete();
            User::whereIn('id', $userIds)->delete();

            DB::commit();
            return response()->json(['message' => count($validated['ids']) . ' teachers deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to delete teachers',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:teachers,id',
            'specialization' => 'nullable|string',
        ]);

        $updateData = [];
        if (isset($validated['specialization'])) {
            $updateData['specialization'] = $validated['specialization'];
        }

        if (empty($updateData)) {
            return response()->json(['message' => 'No update data provided'], 400);
        }

        try {
            Teacher::whereIn('id', $validated['ids'])->update($updateData);
            return response()->json(['message' => count($validated['ids']) . ' teachers updated successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update teachers',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
