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
        Schema::table('payments', function (Blueprint $table) {
            $table->index('status');
            $table->index('payment_date');
            $table->index('type');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index('status');
            $table->index('due_date');
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->index('exam_date');
            $table->index('is_published');
        });

        Schema::table('assignment_submissions', function (Blueprint $table) {
            $table->index('status');
            $table->index('submitted_at');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->index('status');
            $table->index('class_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['payment_date']);
            $table->dropIndex(['type']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['due_date']);
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->dropIndex(['exam_date']);
            $table->dropIndex(['is_published']);
        });

        Schema::table('assignment_submissions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['submitted_at']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['class_id']);
        });
    }
};
