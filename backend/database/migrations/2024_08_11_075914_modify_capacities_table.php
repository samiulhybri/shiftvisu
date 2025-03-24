<?php

use App\Models\Shift;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('capacities')->delete();
        Schema::table('capacities', function (Blueprint $table) {
            $table->foreignIdFor(Shift::class)->constrained()->cascadeOnDelete();
            $table->dropConstrainedForeignId('shift_model_id');
            $table->dropColumn(['is_day_off']);
            $table->dropUnique(['date', 'capacitable_id', 'capacitable_type']);
            $table->unique(['date', 'capacitable_id', 'capacitable_type', 'shift_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('capacities', function (Blueprint $table) {
            $table->dropUnique(['date', 'capacitable_id', 'capacitable_type', 'shift_id']);
            $table->unique(['date', 'capacitable_id', 'capacitable_type', 'shift_id']);
            $table->dropConstrainedForeignId('shift_id');
            $table->foreignId('shift_model_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_day_off');
        });
    }
};
