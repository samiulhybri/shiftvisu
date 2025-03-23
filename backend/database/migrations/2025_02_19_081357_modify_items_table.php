<?php

use App\Models\Item;
use App\Models\ItemGroup;
use App\Models\ItemType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->foreignIdFor(ItemType::class)->nullable()->constrained()->nullOnDelete();
        });

        Item::query()->update(['item_type_id' => DB::raw('item_group_id'), 'item_group_id' => null]);
        ItemGroup::query()->each(function ($itemGroup) {
            $itemGroup->delete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        ItemType::all()->each(function ($itemType) {
            ItemGroup::query()->insert([
                'id' => $itemType->id,
                'custom_id' => $itemType->custom_id,
                'name' => $itemType->name,
                'is_stocked_in_hu' => $itemType->is_stocked_in_hu,
                'is_packaging' => $itemType->is_packaging,
            ]);
        });

        Item::query()->update(['item_group_id' => DB::raw('item_type_id'), 'item_type_id' => null]);

        Schema::table('items', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(ItemType::class);
        });
    }
};
