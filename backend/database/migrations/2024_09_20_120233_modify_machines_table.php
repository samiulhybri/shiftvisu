<?php

use App\Models\MachineState;
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
        Schema::table('machines', function (Blueprint $table) {
            $table->foreignIdFor(MachineState::class, "machine_state_id_default_production")->nullable()->constrained();
            $table->foreignIdFor(MachineState::class, "machine_state_id_default_off")->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(MachineState::class, "machine_state_id_default_production");
            $table->dropConstrainedForeignIdFor(MachineState::class, "machine_state_id_default_off");
        });
    }
};
