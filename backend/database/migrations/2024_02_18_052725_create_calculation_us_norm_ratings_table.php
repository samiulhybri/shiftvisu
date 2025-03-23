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
        Schema::create('calculation_us_norm_ratings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_us_norm_id');
            $table->foreign('calculation_us_norm_id', 'calculation_us_norm_id_ratings')
                ->references('id')
                ->on('calculation_us_norms')
                ->cascadeOnDelete();
            $table->string('rating')->nullable();
            $table->string('probe')->nullable();
            $table->string('test_direction')->nullable();
            $table->double('sender_section')->nullable();
            $table->double('amplification')->nullable();
            $table->double('justification')->nullable();
            $table->double('ksr')->nullable();
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
        Schema::dropIfExists('calculation_us_norm_ratings');
    }
};
