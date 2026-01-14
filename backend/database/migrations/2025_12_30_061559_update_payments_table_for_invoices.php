<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('invoice_id')->nullable()->after('student_id')->constrained()->onDelete('cascade');
            $table->string('method')->nullable()->after('amount'); // Cash, Bank Transfer, Online
            $table->string('receipt_path')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropColumn(['invoice_id', 'method', 'receipt_path']);
        });
    }
};
