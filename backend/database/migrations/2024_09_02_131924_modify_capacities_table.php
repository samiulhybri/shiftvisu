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
        Schema::table("capacities", function (Blueprint $table) {
            $table->time("start_time")->nullable();
            $table->time("end_time")->nullable();
            $table->integer("break_minutes")->nullable();
            $table->string("date_to_consider")->nullable();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("
        UPDATE capacities
        SET
            start_time = shifts.start_time,
            end_time = shifts.end_time,
            break_minutes = shifts.break_minutes,
            date_to_consider = shifts.date_to_consider
        FROM shifts
        WHERE capacities.shift_id = shifts.id
    ");
        } else {
            DB::statement("
        UPDATE capacities
        JOIN shifts ON capacities.shift_id = shifts.id
        SET
            capacities.start_time = shifts.start_time,
            capacities.end_time = shifts.end_time,
            capacities.break_minutes = shifts.break_minutes,
            capacities.date_to_consider = shifts.date_to_consider
    ");
        }

        Schema::table("capacities", function (Blueprint $table) {
            $table->time("start_time")->change();
            $table->time("end_time")->change();
            $table->integer("break_minutes")->change();
            $table->string("date_to_consider")->change();

            $table->foreignIdFor(Shift::class)
                ->nullable()
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("capacities", function (Blueprint $table) {
            $table->dropColumn("start_time");
            $table->dropColumn("end_time");
            $table->dropColumn("break_minutes");
            $table->dropColumn("date_to_consider");

            $table->foreignIdFor(Shift::class)
                ->change();
        });
    }
};
