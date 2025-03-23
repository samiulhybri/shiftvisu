<?php

use App\Models\PackagingInstruction;
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
        Schema::table('handling_units', function (Blueprint $table) {

            // Add packaging_instruction column as a foreign key, nullable
            $table->foreignIdFor(PackagingInstruction::class)->nullable()->constrained();

            // Add is_complete column as a boolean with a default value of false
            $table->boolean('is_complete')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('handling_units', function (Blueprint $table) {

            // Drop the foreign key and the column for packaging_instruction
            $table->dropConstrainedForeignIdFor(PackagingInstruction::class);

            // Drop the is_complete column
            $table->dropColumn('is_complete');
        });
    }
};
