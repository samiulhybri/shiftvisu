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
        Schema::table('material_analyses', function (Blueprint $table) {
            $table->dropColumn([
                'mq_quality',
                'me_quality',
                'is_classified_steel_plant',
                'is_eu_material',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('material_analyses', function (Blueprint $table) {
            $table->string('mq_quality')->nullable();
            $table->string('me_quality')->nullable();
            $table->boolean('is_classified_steel_plant')->default(false);
            $table->boolean('is_eu_material')->default(false);
        });
    }
};
