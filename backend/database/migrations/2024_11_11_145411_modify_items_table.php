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
        Schema::table('items', function (Blueprint $table) {
            $table->foreignIdFor(PackagingInstruction::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(PackagingInstruction::class, 'packaging_instruction_id_2')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(PackagingInstruction::class, 'packaging_instruction_id_3')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(PackagingInstruction::class, 'packaging_instruction_id_4')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(PackagingInstruction::class);
            $table->dropConstrainedForeignIdFor(PackagingInstruction::class, 'packaging_instruction_id_2');
            $table->dropConstrainedForeignIdFor(PackagingInstruction::class, 'packaging_instruction_id_3');
            $table->dropConstrainedForeignIdFor(PackagingInstruction::class, 'packaging_instruction_id_4');
        });
    }
};
