<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\PlanVisuColorScheme;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plan_visu_color_scheme_sortings', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(PlanVisuColorScheme::class)->constrained(indexName: 'fk_plan_visu_color_scheme_id_value');
            $table->integer('sorting');
            $table->string('model_type');
            $table->string('model_column');
            $table->string('value_string');
            $table->string('color');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_visu_color_scheme_sortings');
    }
};
