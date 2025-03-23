<?php

use App\Models\MarkerRecipePos;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('marker_recipe_pos_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(MarkerRecipePos::class)->constrained()->cascadeOnDelete();
            $table->integer('order');
            $table->unique(['marker_recipe_pos_id', 'order']);
            $table->string('marker_block_type');
            $table->string('date_time_format_string');
            $table->string('text');
            $table->integer('ascii_dec');
            $table->integer('shot_counter_length');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::dropIfExists('marker_recipe_pos_blocks');
    }
};
