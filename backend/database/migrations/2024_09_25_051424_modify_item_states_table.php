<?php

use App\Enums\ItemStateType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('item_states', function (Blueprint $table) {
            $table->string('item_state_type')->default(ItemStateType::SCRAP())->change();
        });
        DB::table('item_states')
            ->where('item_state_type', "BAD")
            ->update(['item_state_type' => ItemStateType::SCRAP()]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_states', function (Blueprint $table) {
            //
        });
    }
};
