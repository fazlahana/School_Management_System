<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Monthly Tuition, Annual Sports Fee
            $table->decimal('amount', 10, 2);
            $table->foreignId('class_id')->nullable()->constrained('classes')->onDelete('cascade'); // If null, applies to all
            $table->string('frequency'); // monthly, yearly, one_time
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};
