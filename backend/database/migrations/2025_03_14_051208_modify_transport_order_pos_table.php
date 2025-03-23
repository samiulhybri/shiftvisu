<?php

use App\Models\ItemState;
use App\Models\Machine;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('transport_order_pos', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Machine::class);
            $table->foreignIdFor(ItemState::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('transport_order_pos', function (Blueprint $table) {
            $table->foreignIdFor(Machine::class)->nullable()->constrained()->nullOnDelete();
            $table->dropConstrainedForeignIdFor(ItemState::class);
        });
    }
};
