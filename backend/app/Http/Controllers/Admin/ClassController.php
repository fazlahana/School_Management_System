<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ClassModel;

class ClassController extends Controller
{
    public function index()
    {
        $classes = ClassModel::with('teacher.user')->paginate(10);
        return response()->json($classes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'section' => 'nullable|string',
            'capacity' => 'integer|min:1',
            'teacher_id' => 'nullable|exists:teachers,id',
        ]);

        try {
            $class = ClassModel::create($validated);
            return response()->json($class->load('teacher.user'), 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create class',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        return response()->json(ClassModel::with('teacher.user')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $class = ClassModel::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'section' => 'nullable|string',
            'capacity' => 'integer|min:1',
            'teacher_id' => 'nullable|exists:teachers,id',
        ]);

        try {
            $class->update($validated);
            return response()->json($class->load('teacher.user'));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update class',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        ClassModel::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
