<?php

use App\Models\InspectionLot;
use App\Models\ProdInspectionOperation;
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
        Schema::create('inspection_points', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(InspectionLot::class)->constrained();
            $table->foreignIdFor(ProdInspectionOperation::class)->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_points');
    }
};
