<?php

use App\Models\Item;
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
        Schema::create('prod_order_pos_operation_consumptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prod_order_pos_operation_id');
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_popo_consumptions')->references('id')->on('prod_order_pos_operations')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('prod_order_pos_operation_quantity_id')->nullable();
            // popoq => prod_order_pos_operation_quantity
            $table->foreign('prod_order_pos_operation_quantity_id', 'popoq_id_foreign_for_popo_consumptions')->references('id')->on('prod_order_pos_operation_quantities')->constrained()->onDelete('set null');
            $table->foreignIdFor(Item::class)->constrained()->cascadeOnDelete();
            $table->double('quantity')->default(1);
            $table->string('serial')->nullable();
            $table->string('batch')->nullable();
            $table->dateTime('consumed_datetime');
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
        Schema::dropIfExists('prod_order_pos_operation_consumptions');
    }
};
