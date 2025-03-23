<?php

use App\Models\Capacity;
use App\Models\MachineCycle;
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
        Schema::table('inspection_points', function (Blueprint $table) {
            $table->foreignIdFor(MachineCycle::class, 'machine_cycle_id_trigger')->nullable()->constrained();
            $table->foreignIdFor(Capacity::class, 'capacity_id_trigger')->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspection_points', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(MachineCycle::class, 'machine_cycle_id_trigger');
            $table->dropConstrainedForeignIdFor(Capacity::class, 'capacity_id_trigger');
        });
    }
};
