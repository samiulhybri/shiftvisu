<?php

use App\Enums\ItemStateType;
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
        Schema::rename("bad_part_reasons", "item_states");
        Schema::rename("bad_part_reasons_halls", "item_state_halls");
        Schema::rename("bad_part_reason_machines", "item_state_machines");

        Schema::table('item_states', function (Blueprint $table) {
            $table->string("item_state_type")->default(ItemStateType::SCRAP());
            $table->dropUnique("bad_part_reasons_custom_id_unique");
            $table->unique("custom_id");
        });

        Schema::table("item_state_halls", function (Blueprint $table) {
            $table->renameColumn("bad_part_reason_id", "item_state_id");
            $table->dropForeign("bad_part_reasons_halls_bad_part_reason_id_foreign");
        });
        Schema::table("item_state_halls", function (Blueprint $table) {
            $table->foreignIdFor(ItemState::class)->change()->constrained()->cascadeOnDelete();
        });
        Schema::table("item_state_machines", function (Blueprint $table) {
            $table->renameColumn("bad_part_reason_id", "item_state_id");
            $table->dropForeign("bad_part_reason_machines_bad_part_reason_id_foreign");
        });
        Schema::table("item_state_machines", function (Blueprint $table) {
            $table->foreignIdFor(ItemState::class)->change()->constrained()->cascadeOnDelete();
        });
        Schema::table("stocks", function (Blueprint $table) {
            $table->renameColumn("bad_part_reason_id", "item_state_id");
        });
        Schema::table("prod_order_pos_operation_quantities", function (Blueprint $table) {
            $table->renameColumn("bad_part_reason_id", "item_state_id");
        });

        $goodState = new ItemState();
        $goodState->name = "Good";
        $goodState->custom_id = "DEFAULT_GOOD_STATE";
        $goodState->item_state_type = ItemStateType::GOOD();
        $goodState->save();

        DB::table("stocks")
            ->whereNull("item_state_id")
            ->update(["item_state_id" => $goodState->id]);

        DB::table("prod_order_pos_operation_quantities")
            ->whereNull("item_state_id")
            ->update(["item_state_id" => $goodState->id]);

        // make the columns not nullable
        Schema::table("stocks", function (Blueprint $table) {
            $table->dropForeign("stocks_bad_part_reason_id_foreign");
        });
        Schema::table("stocks", function (Blueprint $table) {
            $table->foreignIdFor(ItemState::class)->change()->constrained()->cascadeOnDelete();
        });
        Schema::table("prod_order_pos_operation_quantities", function (Blueprint $table) {
            $table->dropForeign("prod_order_pos_operation_quantities_bad_part_reason_id_foreign");
        });
        Schema::table("prod_order_pos_operation_quantities", function (Blueprint $table) {
            $table->foreignIdFor(ItemState::class)->change()->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename("item_states", "bad_part_reasons");
        Schema::rename("item_state_halls", "bad_part_reasons_halls");
        Schema::rename("item_state_machines", "bad_part_reason_machines");

        Schema::table("stocks", function (Blueprint $table) {
            $table->dropForeign("stocks_item_state_id_foreign");
            $table->renameColumn("item_state_id", "bad_part_reason_id");
            $table->foreignId("bad_part_reason_id")->change()->nullable()->constrained()->nullOnDelete();
        });
        Schema::table("prod_order_pos_operation_quantities", function (Blueprint $table) {
            $table->dropForeign("prod_order_pos_operation_quantities_item_state_id_foreign");
            $table->renameColumn("item_state_id", "bad_part_reason_id");
            $table->foreignId("bad_part_reason_id")->change()->nullable()->constrained()->nullOnDelete();
        });

        Schema::table("bad_part_reasons", function (Blueprint $table) {
            $table->dropColumn("item_state_type");
            $table->dropUnique("item_states_custom_id_unique");
            $table->unique("custom_id");
        });

        Schema::table("bad_part_reasons_halls", function (Blueprint $table) {
            $table->renameColumn("item_state_id", "bad_part_reason_id");
            $table->dropForeign("item_state_halls_item_state_id_foreign");
            $table->foreignId("bad_part_reason_id")->change()->nullable()->constrained()->nullOnDelete();
        });

        Schema::table("bad_part_reason_machines", function (Blueprint $table) {
            $table->renameColumn("item_state_id", "bad_part_reason_id");
            $table->dropForeign("item_state_machines_item_state_id_foreign");
            $table->foreignId("bad_part_reason_id")->change()->nullable()->constrained()->nullOnDelete();
        });
    }
};
