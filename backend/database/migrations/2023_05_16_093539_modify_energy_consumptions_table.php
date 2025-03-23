<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */

    public function up()
    {
        Schema::table('energy_consumptions', function ($table) {
            $table->dropUnique('alternative_unique_index');
        });
        if (Schema::hasColumn('energy_consumptions', 'hour_of_day')) {
            Schema::table('energy_consumptions', function ($table) {
                $table->dropColumn('hour_of_day');
            });
        }
        
        if (!Schema::hasColumn('energy_consumptions', 'consumption_hour')) {
            Schema::table('energy_consumptions', function ($table) {
                $table->timestamp('consumption_hour')
                    ->nullable(false)
                    ->useCurrent()
                    ->after('energy_type');
            });
        }

        $consumptions = DB::table('energy_consumptions')->get();
        foreach ($consumptions as $consumption) {
            $created_at = Carbon::parse($consumption->created_at);
            $consumption_hour = $created_at->subHour()->startOfHour();
            DB::table('energy_consumptions')->where('id', $consumption->id)->update(['consumption_hour' => $consumption_hour]);
        }

        Schema::table('energy_consumptions', function ($table) {
            $table->unique(['date', 'energy_consumer_id', 'consumption_hour', 'energy_type'], 'alternative_unique_index');
        });
    }


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
    }
};
