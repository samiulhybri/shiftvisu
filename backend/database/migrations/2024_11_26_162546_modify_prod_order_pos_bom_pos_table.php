<?php

use App\Models\StorageBin;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->string('item_type', 4)->nullable();
            $table->string('reference_document')->nullable();
            $table->string('item_numver')->nullable();
            $table->foreignIdFor(StorageBin::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->dropColumn(['item_type', 'reference_document', 'item_numver']);
            $table->dropConstrainedForeignIdFor(StorageBin::class);
        });
    }
};
