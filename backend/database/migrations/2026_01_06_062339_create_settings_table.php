<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('settings')->insert([
            ['key' => 'school_name', 'value' => 'EduSpire International'],
            ['key' => 'school_email', 'value' => 'admin@eduspire.com'],
            ['key' => 'school_phone', 'value' => '+1 234 567 890'],
            ['key' => 'school_address', 'value' => '123 Education Lane, Tech City'],
            ['key' => 'currency_symbol', 'value' => '$'],
            ['key' => 'academic_year', 'value' => '2025-2026'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
