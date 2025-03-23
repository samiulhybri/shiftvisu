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
        Schema::table('specifications', function (Blueprint $table) {
            $table->string('cleanliness_50602')->nullable();
            $table->integer('k4')->nullable() ;
            $table->integer('k3')->nullable() ;
            $table->integer('k2')->nullable() ;
            $table->string('cleanliness_4967')->nullable() ;
            $table->double('a_fine')->nullable() ;
            $table->double('a_coarse')->nullable() ;
            $table->double('b_fine')->nullable() ;
            $table->double('b_coarse')->nullable() ;
            $table->double('c_fine')->nullable() ;
            $table->double('c_coarse')->nullable() ;
            $table->double('d_fine')->nullable() ;
            $table->double('d_coarse')->nullable() ;
            $table->double('ds')->nullable() ;
            $table->string('microstructure_assessment')->nullable() ;
            $table->boolean('image')->default(0) ;
            $table->string('microstructure_quota')->nullable() ;
            $table->integer('microstructure_max_quota')->nullable() ;
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('specifications', function (Blueprint $table) {
            $table->dropColumn('cleanliness_50602');
            $table->dropColumn('k4');
            $table->dropColumn('k3');
            $table->dropColumn('k2');
            $table->dropColumn('cleanliness_4967');
            $table->dropColumn('a_fine');
            $table->dropColumn('a_coarse');
            $table->dropColumn('b_fine');
            $table->dropColumn('b_coarse');
            $table->dropColumn('c_fine');
            $table->dropColumn('c_coarse');
            $table->dropColumn('d_fine');
            $table->dropColumn('d_coarse');
            $table->dropColumn('ds');
            $table->dropColumn('microstructure_assessment');
            $table->dropColumn('image');
            $table->dropColumn('microstructure_quota');
            $table->dropColumn('microstructure_max_quota');
        });
    }
};
