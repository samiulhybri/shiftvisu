<?php

use App\Models\Item;
use App\Models\Machine;
use App\Models\Shift;
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
        Schema::create('machine_daily_expected_quantities', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Machine::class)->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Item::class)->nullable()->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->double('quantity');
            $table->double('te')->default(0);
            $table->double('tr')->default(0);
            $table->double('teardown_time')->default(0);
            $table->nullableMorphs('workloadable', indexName: 'workloadable_idx');
            $table->foreignIdFor(Shift::class)->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_daily_expected_quantities');
    }
};
