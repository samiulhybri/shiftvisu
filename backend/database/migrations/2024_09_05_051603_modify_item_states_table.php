<?php

use App\Models\ItemStateGroup;
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
        Schema::table('item_states', function (Blueprint $table) {
            $table->foreignIdFor(ItemStateGroup::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_states', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(ItemStateGroup::class);
        });
    }
};