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
        Schema::create('hwe_qs_samples_prod_order_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hwe_qs_sample_id')->constrained('hwe_qs_samples')->cascadeOnDelete();
            $table->foreignId('prod_order_pos_id')->constrained('prod_order_pos')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['hwe_qs_sample_id', 'prod_order_pos_id'], 'unique_hwe_qs_prod_order');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('hwe_qs_samples_prod_order_pos');
    }
};
