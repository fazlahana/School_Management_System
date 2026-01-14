<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'school_name' => 'EduSpire International School',
            'school_email' => 'admin@eduspire.com',
            'school_phone' => '+1 234 567 890',
            'school_address' => '123 Education Lane, Learning City',
            'school_logo' => '/logo.jpg',
            'currency_symbol' => '$',
        ];

        foreach ($settings as $key => $value) {
            Setting::set($key, $value);
        }
    }
}
