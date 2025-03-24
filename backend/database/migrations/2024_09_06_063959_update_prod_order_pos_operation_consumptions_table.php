<?php

use App\Models\Item;
use App\Models\ItemPlant;
use App\Models\ItemState;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('prod_order_pos_operation_consumptions')->delete();

        Schema::table('prod_order_pos_operation_consumptions', function (Blueprint $table) {
            $table->foreignIdFor(ItemState::class)->constrained();
            $table->dropConstrainedForeignIdFor(Item::class);
            $table->foreignIdFor(ItemPlant::class)->constrained();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('prod_order_pos_operation_consumptions')->delete();

        Schema::table('prod_order_pos_operation_consumptions', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(ItemState::class);
            $table->foreignIdFor(Item::class)->constrained();
            $table->dropConstrainedForeignIdFor(ItemPlant::class);
        });
    }
};
