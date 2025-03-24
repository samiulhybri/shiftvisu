<?php

use App\Models\Machine;
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
        Schema::create('hwe_prod_order_pos_operation_oven_protocols', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prod_order_pos_operation_id');
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_oven_protocols')
                  ->references('id')
                  ->on('prod_order_pos_operations')
                  ->onDelete('cascade');
            $table->dateTime('date');
            $table->string('occupancy_type');
            $table->integer('quantity');
            $table->foreignIdFor(Machine::class)->nullable()->constrained()->nullOnDelete();
            $table->string('position');
            $table->string('occupancy');
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
        Schema::dropIfExists('hwe_prod_order_pos_operation_oven_protocols');
    }
};
