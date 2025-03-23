<?php

use App\Models\Item;
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
        Schema::table('handling_units', function (Blueprint $table) {
            $table->dropForeign(['item_id']); 
            $table->foreignIdFor(Item::class)->change()->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('handling_units', function (Blueprint $table) {
            $table->dropForeign(['item_id']); 
            $table->foreignIdFor(Item::class)->change()->nullable(false)->constrained()->cascadeOnDelete();
        });
    }
};
