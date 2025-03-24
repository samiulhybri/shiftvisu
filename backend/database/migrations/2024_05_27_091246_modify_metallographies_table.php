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
        Schema::table('metallographies', function (Blueprint $table) {
            $table->double('cleanliness_max_value')->nullable();
            $table->double('grain_size_value')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('metallographies', function (Blueprint $table) {
            $table->dropColumn(['cleanliness_max_value','grain_size_value']);
        });
    }
};
