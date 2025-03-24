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
        Schema::create('prod_order_pos_operation_quantities', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Machine::class)->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('prod_order_pos_operation_id');
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_operation_quantities')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\User::class)->constrained()->cascadeOnDelete();
            $table->foreignId("bad_part_reason_id")->constrained()->cascadeOnDelete();
            $table->double('quantity');
            $table->dateTime('confirmed_datetime');
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
        Schema::dropIfExists('prod_order_pos_operation_quantities');
    }
};
