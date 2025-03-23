<?php

use App\Models\NonDestructiveTesting;
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
        NonDestructiveTesting::whereNull('non_destructive_testing')->update(['non_destructive_testing' => '']);

        Schema::table('non_destructive_testings', function (Blueprint $table) {
             $table->string('non_destructive_testing')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('non_destructive_testings', function (Blueprint $table) {
            $table->string('non_destructive_testing')->nullable()->change();
        });
    }
};
