<?php

use App\Models\EnergyMeter;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
        EnergyMeter::whereIn('factor', [NULL, 0])->update(['factor'=>1]);
        Schema::table('energy_meters', function(Blueprint $table) {
            $table->double('factor')->nullable(false)->default(1)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('energy_meters', function(Blueprint $table) {
            $table->double('factor')->nullable()->change();
        });
    }
};
