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
        Schema::table('mp_offers', function (Blueprint $table) {
            $table->string('movements_mechanic')->default('0')->nullable()->change();
            $table->string('movements_hydraulic')->default('0')->nullable()->change();
            $table->string('rods')->default('0')->nullable()->change();
            $table->string('jowls')->default('0')->nullable()->change();
            $table->string('unscrewing')->default('0')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('mp_offers', function (Blueprint $table) {
            $table->dropColumn(['movements_mechanic', 'movements_hydraulic', 'rods', 'jowls', 'unscrewing']);
        });

        Schema::table('mp_offers', function (Blueprint $table) {
            $table->double('movements_mechanic');
            $table->double('movements_hydraulic');
            $table->double('rods');
            $table->double('jowls');
            $table->double('unscrewing');
        });
    }
};
