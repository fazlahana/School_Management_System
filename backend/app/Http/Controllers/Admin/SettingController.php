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
        return \Illuminate\Support\Facades\Cache::remember('public_settings', 3600, function() {
            return \App\Models\Setting::whereIn('key', ['school_name', 'school_logo'])->pluck('value', 'key');
        });
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'school_name' => 'nullable|string|max:255',
            'school_email' => 'nullable|email|max:255',
            'school_phone' => 'nullable|string|max:20',
            'school_address' => 'nullable|string|max:500',
            'currency_symbol' => 'nullable|string|max:10',
            'academic_year' => 'nullable|string|max:20',
            'school_logo' => 'nullable|image|max:2048', // 2MB Max
        ]);

        if ($request->hasFile('school_logo')) {
            $path = $request->file('school_logo')->store('school', 'public');
            Setting::set('school_logo', '/storage/' . $path);
        }

        foreach ($validated as $key => $value) {
            if ($key !== 'school_logo' && $value !== null) {
                Setting::set($key, $value);
            }
        }

        \Illuminate\Support\Facades\Cache::forget('public_settings');
        
        $this->logActivity('updated_settings', null, null, $request->except(['school_logo'])); // Don't log binary data

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => Setting::all()->pluck('value', 'key')
        ]);
    }
}
