<?php

use App\Models\Item;
use App\Models\Plant;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // TODO: Only execute when needed.
        // if (Plant::count() === 0) {
        $plant = new Plant();
        $plant->name = 'Default Plant';
        $plant->custom_id = "DEFAULT";
        $plant->is_active = true;
        $plant->save();

        foreach (Item::all(['id'])->pluck('id')->chunk(env("DATA_CHUNK_SIZE")) as $chunk) {
            $plant->items()->attach($chunk->toArray());
        }

        //}
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Plant::where('custom_id', 'DEFAULT')->delete();
    }
};
