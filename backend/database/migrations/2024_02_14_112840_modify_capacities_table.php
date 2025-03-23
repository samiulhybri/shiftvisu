<?php

use App\Models\Capacity;
use App\Models\Hall;
use App\Models\Machine;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;
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
        Schema::table('capacities', function (Blueprint $table) {
            $table->morphs('capacitable');
        });

        /**
         * I will include machine_id under polymorphic
         * Need to remove in up migration from capacities table
         * 
         * Before droping column I'll organize the data.
         */

        Capacity::chunk(env('DATA_CHUNK_SIZE'), function (Collection $capacities) {
            foreach ($capacities as $capacity) {
                $capacity->capacitable_id = $capacity->machine_id;
                $capacity->capacitable_type = Machine::class;
                $capacity->save();
            }
        });

        Schema::table('capacities', function (Blueprint $table) {
            $table->unique(['date', 'capacitable_id', 'capacitable_type']);
            $table->dropUnique(['date', 'machine_id']);
            $table->dropConstrainedForeignId('machine_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // delete all records for halls
        Hall::all()->each(function ($hall) {
            $hall->capacities()->delete();
        });

        $setting = Setting::first();

        // delete all records for company
        if ($setting) {
            $setting->capacities()->delete();
        }

        Schema::table('capacities', function (Blueprint $table) {
            $table->foreignIdFor(Machine::class)->nullable()->constrained()->nullOnDelete();
        });
        
        // reverse of the previous update
        Machine::all()->each(function (Machine $machine) {
            $machine->capacities->each(function ($capacity) use ($machine) {
                $capacity->machine_id = $machine->id;
                $capacity->save();
            });
        });

        Schema::table('capacities', function (Blueprint $table) {
            $table->dropUnique(['date', 'capacitable_id', 'capacitable_type']);
            $table->dropMorphs('capacitable');
            $table->unique(['date', 'machine_id']);
        });
    }
};
