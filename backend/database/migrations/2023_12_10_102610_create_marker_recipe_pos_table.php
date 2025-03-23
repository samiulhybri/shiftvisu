<?php

use App\Models\MarkerRecipe;
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
        Schema::create('marker_recipe_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(MarkerRecipe::class)->constrained()->cascadeOnDelete();
            $table->string('pos');
            $table->unique(['marker_recipe_id', 'pos']);
            $table->string('marker_pos_type');
            $table->string('font')->nullable();
            $table->double('font_height')->nullable();
            $table->double('font_width')->nullable();
            $table->double('font_space')->nullable();
            $table->double('pos_x')->nullable();
            $table->double('pos_y')->nullable();
            $table->double('pos_z')->nullable();
            $table->double('angle')->nullable();
            $table->boolean('should_touch_probe')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::dropIfExists('marker_recipe_pos');
    }
};
