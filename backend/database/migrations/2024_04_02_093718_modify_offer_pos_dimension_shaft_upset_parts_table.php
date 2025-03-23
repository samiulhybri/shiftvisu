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
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
            $table->dropColumn('sample_allowance');
            $table->double('oversize')->nullable();
            $table->boolean('is_sample')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
            $table->double('sample_allowance')->nullable();
            $table->dropColumn(['is_sample', 'oversize']);
        });
    }
};
