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
        Schema::table('machine_registered_times', function (Blueprint $table) {
            $table->date("date")->nullable();
            $table->foreignIdFor(Shift::class)->nullable()->constrained();
        });

        // set existing entries to the date of the start
        DB::table('machine_registered_times')->update(['date' => DB::raw('start')]);

        Schema::table('machine_registered_times', function (Blueprint $table) {
            $table->date("date")->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machine_registered_times', function (Blueprint $table) {
            $table->dropColumn("date");
            $table->dropForeign(['shift_id']);
        });
    }
};
