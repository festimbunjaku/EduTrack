<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First add the column
        Schema::table('homework', function (Blueprint $table) {
            $table->dateTime('due_date')->nullable()->after('deadline');
        });
        
        // Then update the values
        DB::statement('UPDATE homework SET due_date = deadline');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('homework', function (Blueprint $table) {
            $table->dropColumn('due_date');
        });
    }
};
