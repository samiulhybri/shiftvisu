<?php

use App\Enums\ComponentPreparationState;
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
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->dropColumn(['is_prepared']);
            $table->string('component_preparation_state')->nullable()->default(ComponentPreparationState::NOT_PREPARED->value);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->dropColumn(['component_preparation_state']);
            $table->boolean('is_prepared')->nullable()->default(false);
        });
    }
};
