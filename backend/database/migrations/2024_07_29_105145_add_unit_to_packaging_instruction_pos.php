<?php

use App\Models\UnitOfMeasure;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('packaging_instruction_pos', function (Blueprint $table) {
            $table->foreignIdFor(UnitOfMeasure::class)->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packaging_instruction_pos', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(UnitOfMeasure::class);
        });
    }
};
