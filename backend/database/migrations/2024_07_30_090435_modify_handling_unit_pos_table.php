<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\HandlingUnit;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('handling_unit_pos');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('handling_unit_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(HandlingUnit::class)->constrained()->cascadeOnDelete();
            $table->string('batch')->nullable();
            $table->string('serial')->nullable();
            $table->double('quantity')->nullable();
            $table->double('erp_quantity')->nullable();
            $table->string('packable_type')->nullable();
            $table->unsignedBigInteger('packable_id')->nullable();
            $table->foreignId("bad_part_reason_id")->nullable()
                ->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }
};
