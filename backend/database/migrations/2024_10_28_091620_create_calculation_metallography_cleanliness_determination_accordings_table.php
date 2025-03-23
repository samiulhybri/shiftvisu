<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('calculation_metallography_cleanliness_determination_accordings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_metallography_id');
            $table->foreign('calculation_metallography_id', 'calculation_metallography_id_foreign_cdat')
                    ->references('id')
                    ->on('calculation_metallographies')
                    ->cascadeOnDelete();
            $table->string('cleanliness_determination_according_to');
            $table->unique(['calculation_metallography_id','cleanliness_determination_according_to'],'calc_metallo_id_clean_deter_accord_to_index');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calculation_metallography_cleanliness_determination_accordings');
    }
};
