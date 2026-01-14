<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subject;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::paginate(10);
        return response()->json($subjects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'required|unique:subjects',
        ]);

        try {
            $subject = Subject::create($validated);
            return response()->json($subject, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create subject',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        return response()->json(Subject::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'required|unique:subjects,code,' . $id,
        ]);

        try {
            $subject->update($validated);
            return response()->json($subject);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update subject',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        Subject::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
