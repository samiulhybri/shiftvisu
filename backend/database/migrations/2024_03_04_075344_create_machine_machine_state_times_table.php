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
        Schema::create('machine_machine_state_times', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Machine::class)->constrained();
            $table->foreignIdFor(MachineState::class)->nullable()->constrained()->nullOnDelete();
            $table->dateTime('start')->useCurrent();
            $table->dateTime('end')->nullable();
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
        Schema::dropIfExists('machine_machine_state_times');
    }
};
