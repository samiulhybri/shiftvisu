<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bad_part_reason_machines', function (Blueprint $table) {
            $table->id();
            $table->foreignId("bad_part_reason_id")->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\Machine::class)->constrained()->cascadeOnDelete();
            $table->unique('bad_part_reason_id', 'machine_id');
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
        Schema::dropIfExists('bad_part_reason_machines');
    }
};
