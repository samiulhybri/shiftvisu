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
        Schema::create('calculation_non_destructive_norms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_non_destructive_testing_id');
            $table->foreign('calculation_non_destructive_testing_id', 'calculation_non_destructive_testing_id_foreign_key')
                ->unique()
                ->references('id')
                ->on('calculation_non_destructive_norms')
                ->cascadeOnDelete();
            $table->morphs('norm');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('calculation_non_destructive_norms');
    }
};
