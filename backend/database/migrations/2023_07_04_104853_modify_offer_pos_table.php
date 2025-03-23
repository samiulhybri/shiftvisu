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
        Schema::table('offer_pos', function (Blueprint $table) {
           $table->boolean('is_commission')->default(false);
           $table->boolean('is_standard_item')->default(false);
           $table->foreignId('material_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->dropColumn('is_commission');
            $table->dropColumn('is_standard_item');
            $table->dropForeign('offer_pos_material_id_foreign');
            $table->dropColumn('material_id');
        });
    }
};
