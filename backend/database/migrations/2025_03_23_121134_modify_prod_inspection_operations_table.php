<?php

use App\Models\Capacity;
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
        Schema::table('prod_inspection_operations', function (Blueprint $table) {
            $table->foreignIdFor(Capacity::class, 'capacity_id_last_point')->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_inspection_operations', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Capacity::class, 'capacity_id_last_point');
        });
    }
};
