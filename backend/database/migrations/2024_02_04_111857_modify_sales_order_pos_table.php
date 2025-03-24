<?php

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
        Schema::table('sales_order_pos', function (Blueprint $table) {
            $table->string('customer_reference')->nullable();
            $table->string('customer_material_number')->nullable();
            $table->date('delivery_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sales_order_pos', function (Blueprint $table) {
            $table->dropColumn(['customer_reference',
                'customer_material_number',
                'delivery_date']
            );
        });
    }
};
