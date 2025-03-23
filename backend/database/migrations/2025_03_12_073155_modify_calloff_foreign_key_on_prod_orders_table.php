<?php

use App\Models\CallOff;
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
        Schema::table('prod_orders', function (Blueprint $table) {
            // Drop the old foreign key constraint
            $table->dropConstrainedForeignIdFor(CallOff::class);
            
            // Add the new foreign key with 'onDelete' constraint
            $table->foreignIdFor(CallOff::class)
                ->nullable()
                ->constrained()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_orders', function (Blueprint $table) {
            // Drop the new foreign key constraint
            $table->dropConstrainedForeignIdFor(CallOff::class);

            // Recreate the old foreign key constraint without 'onDelete'
            $table->foreignIdFor(CallOff::class)
                    ->nullable()
                    ->constrained();
        });
    }
};
