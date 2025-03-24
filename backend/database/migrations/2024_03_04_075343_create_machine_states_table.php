<?php

use App\Models\MachineStateGroup;
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
        Schema::create('machine_states', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->boolean('is_active')->default(true);
            $table->string('name');
            $table->foreignIdFor(MachineStateGroup::class)->constrained();
            $table->string('color', 6)->default('000000');
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
        Schema::dropIfExists('machine_states');
    }
};
