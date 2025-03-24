<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        #field string to number convert so create a issue if not do that

        Schema::table('deformations', function (Blueprint $table) {
            $table->dropColumn('deformation');
        });
        Schema::table('deformations', function (Blueprint $table) {
            $table->double('deformation')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('deformations', function (Blueprint $table) {
            $table->string('deformation')->nullable()->change();
        });
    }
};
