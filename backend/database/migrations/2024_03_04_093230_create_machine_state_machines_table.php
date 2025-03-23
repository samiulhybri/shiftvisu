<?php

use App\Models\Machine;
use App\Models\MachineState;
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
        Schema::create('machine_state_machines', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(MachineState::class)->constrained();
            $table->foreignIdFor(Machine::class)->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('machine_state_machines');
    }
};
