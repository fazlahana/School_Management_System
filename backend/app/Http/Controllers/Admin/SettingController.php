<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use App\Traits\Trackable;

class SettingController extends Controller
{
    use Trackable;

    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function publicSettings()
    {
        $settings = \App\Models\Setting::whereIn('key', ['school_name', 'school_logo'])->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'school_email' => 'required|email|max:255',
            'school_phone' => 'nullable|string|max:20',
            'school_address' => 'nullable|string|max:500',
            'currency_symbol' => 'nullable|string|max:10',
            'academic_year' => 'nullable|string|max:20',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value);
            }
        }

        $this->logActivity('updated_settings', null, null, $validated);

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
