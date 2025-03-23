<?php

use App\Models\ItemState;
use App\Models\Item;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('handling_unit_pos', function (Blueprint $table) {
            $table->dropForeign('handling_unit_items_item_id_foreign');
            $table->dropColumn('item_id');
            $table->nullableMorphs('packable');
            $table->foreignId("bad_part_reason_id")->nullable()
                ->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('handling_unit_pos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bad_part_reason_id');
            $table->dropMorphs('packable');
            $table->foreignIdFor(Item::class)->nullable()->constrained()->nullOnDelete();
        });
    }
};
