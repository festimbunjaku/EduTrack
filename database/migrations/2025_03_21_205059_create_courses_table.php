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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('feature_1');
            $table->string('feature_2');
            $table->string('feature_3');
            $table->decimal('price', 10, 2)->default(0.00);
            $table->date('start_date');
            $table->date('end_date');
            $table->json('schedule')->comment('JSON with days and times');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->integer('max_enrollment')->default(20);
            $table->string('location');
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
