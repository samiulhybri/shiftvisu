<?php

use App\Models\Machine;
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
        Schema::create('machine_prod_order_pos_operation_times', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Machine::class)
                ->constrained()
                ->cascadeOnDelete();
            $table->unsignedBigInteger('prod_order_pos_operation_id');
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_operation_times')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->cascadeOnDelete();
            $table->dateTime('start')->useCurrent();
            $table->dateTime('end')->nullable();
            $table->double('cavity')->default(1);
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
        Schema::dropIfExists('machine_prod_order_pos_operation_times');
    }
};
