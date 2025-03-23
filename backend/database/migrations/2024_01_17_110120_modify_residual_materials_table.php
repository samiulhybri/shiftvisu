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
        Schema::table('residual_materials', function (Blueprint $table) {
            $table->string('cross_section_type')->nullable();
            $table->string('marking')->nullable()->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('residual_materials', function (Blueprint $table) {
            $table->dropColumn(['marking']);
        });

        Schema::table('residual_materials', function (Blueprint $table) {
            $table->dropColumn('cross_section_type');
            $table->boolean('marking')->default(false)->nullable(false);
        });
    }
};
