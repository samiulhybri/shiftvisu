<?php

use App\Models\ShiftVisu\ShiftVisuComponent;
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
        Schema::create('shift_visu_component_options', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ShiftVisuComponent::class)->constrained()->cascadeOnDelete();
            $table->string('option');
            $table->unique(['shift_visu_component_id', 'option'], 'unique_component_option');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shift_visu_component_options', function (Blueprint $table) {
            $table->dropForeign(['shift_visu_component_id']);
            $table->dropUnique('unique_component_option');
        });
        Schema::dropIfExists('shift_visu_component_options');
    }
};
