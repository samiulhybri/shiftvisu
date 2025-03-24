<?php

use App\Enums\StockOperationType;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_operations', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->nullable();
            $table->foreignIdFor(User::class)->constrained();
            $table->dateTime('performed_datetime');
            $table->string('type')->default(StockOperationType::GOODS_RECEIPT());
            $table->nullableMorphs('context');

            $table->unique('custom_id');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_operations');
    }
};
