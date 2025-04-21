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
        Schema::create('shift_visu_overview_component_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('overview_details_id')->nullable();

            $table->foreign('overview_details_id', 'fk_overview_detail')
                  ->references('id')
                  ->on('shift_visu_overview_details')
                  ->onDelete('cascade');

            $table->integer('component_id');
            $table->string('view_in')->nullable();
            $table->string('component_type')->nullable();
            $table->integer('option_id')->nullable();
            $table->string('option_value')->nullable();
            $table->string('model_type')->nullable();
            $table->boolean('option_value_is_checked')->default(0);
            $table->dateTime('option_value_date')->nullable();
            $table->longText('option_value_text')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_visu_overview_component_options');
    }
};
