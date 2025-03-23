<?php

use App\Models\ProdOrderPosOperation;
use App\Models\User;
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
        Schema::create('prod_order_pos_operation_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('prod_order_pos_operation_id')->nullable();
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_operation_deliveries')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->nullOnDelete();
            $table->integer('quantity')->default(0);
            $table->boolean('is_completed')->default(false);
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
        Schema::dropIfExists('prod_order_pos_operation_deliveries');
    }
};
