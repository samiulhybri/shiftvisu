<?php

use App\Models\Machine;
use App\Models\ProdOrderPosOperation;
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
            $table->foreignIdFor(Machine::class)->constrained();
            $table->foreignIdFor(ProdOrderPosOperation::class)->constrained();
            $table->dateTime('date_opened')->useCurrent();
            $table->dateTime('date_completed')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspection_points', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Machine::class);
            $table->dropConstrainedForeignIdFor(ProdOrderPosOperation::class);
            $table->dropColumn(['date_opened', 'date_completed']);
        });
    }
};
