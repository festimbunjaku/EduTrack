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
        Schema::table('homework_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('homework_submissions', 'submitted_at')) {
                $table->timestamp('submitted_at')->nullable();
            }
        });
        
        // Update existing records: set submitted_at = created_at
        DB::statement('UPDATE homework_submissions SET submitted_at = created_at WHERE submitted_at IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('homework_submissions', function (Blueprint $table) {
            $table->dropColumn('submitted_at');
        });
    }
};
