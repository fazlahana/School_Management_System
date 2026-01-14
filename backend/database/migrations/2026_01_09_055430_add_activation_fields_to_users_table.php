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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'inactive'])->default('pending')->after('role');
            $table->string('verify_token')->nullable()->after('status');
            $table->timestamp('verify_token_expires_at')->nullable()->after('verify_token');
            $table->string('otp')->nullable()->after('verify_token_expires_at');
            $table->timestamp('otp_expires_at')->nullable()->after('otp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'verify_token', 'verify_token_expires_at', 'otp', 'otp_expires_at']);
        });
    }
};
