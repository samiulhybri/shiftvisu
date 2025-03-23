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
        Schema::table('us_norms', function (Blueprint $table) {
            $table->double('detection_threshold')->nullable();
            $table->double('residual_magnetism')->nullable();
            $table->string('detection_threshold_operator')->nullable();
            $table->string('note')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('us_norms', function (Blueprint $table) {
            $table->dropColumn([
                'detection_threshold',
                'residual_magnetism',
                'detection_threshold_operator',
                'note'
            ]);
        });
    }
};
