<?php

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
        Schema::table("settings", function (Blueprint $table) {
            $table->foreignIdFor(ItemState::class, "item_state_default_good_id")
                ->nullable()->constrained("item_states");
        });

        $itemState = ItemState::where("custom_id", "DEFAULT_GOOD_STATE")->first();
        if ($itemState) {
            DB::table("settings")
                ->whereNull("item_state_default_good_id")
                ->update(["item_state_default_good_id" => $itemState->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("settings", function (Blueprint $table) {
            $table->dropForeignIdFor(ItemState::class, "item_state_default_good_id");
        });
    }
};
