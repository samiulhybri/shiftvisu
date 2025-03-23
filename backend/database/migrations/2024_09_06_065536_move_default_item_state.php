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
        Schema::table('plants', function (Blueprint $table) {
            $table->foreignIdFor(ItemState::class, 'item_state_id_default')->nullable()->constrained();
        });

        $previousDefault = DB::table("settings")
            ->select("item_state_default_good_id")
            ->first()
            ?->item_state_default_good_id;

        if (!$previousDefault) {
            $previousDefault = DB::table("item_states")
                ->select("id")
                ->where("item_state_type", ItemStateType::GOOD())
                ->orderBy("id")
                ->first()
                ->id;
        }

        DB::table("plants")->update(["item_state_id_default" => $previousDefault]);

        Schema::table('plants', function (Blueprint $table) use ($previousDefault) {
            $table
                ->foreignIdFor(ItemState::class, 'item_state_id_default')
                ->default($previousDefault)
                ->change();
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(ItemState::class, 'item_state_default_good_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(ItemState::class, 'item_state_id_default');
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->foreignIdFor(ItemState::class, 'item_state_default_good_id')->nullable()->constrained();
        });
    }
};
