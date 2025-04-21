<?php

use App\Enums\PackagingInstructionMachineStopType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('packaging_instructions', function (Blueprint $table) {
            $table->string('machine_stop_type')->default(PackagingInstructionMachineStopType::NO_STOP);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packaging_instructions', function (Blueprint $table) {
            $table->dropColumn('machine_stop_type');
        });
    }
};
