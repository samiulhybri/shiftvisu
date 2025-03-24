<?php

use Illuminate\Database\Migrations\Migration;
use App\Enums\MachineConstraintType;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->string('constraint_type')->nullable()->default(MachineConstraintType::MANUAL());
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropColumn('constraint_type');
        });
    }
};
