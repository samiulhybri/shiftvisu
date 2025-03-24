<?php

use App\Models\InspectionLot;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inspection_points', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(InspectionLot::class)->constrained()->cascadeOnDelete();
            $table->foreignId('prod_order_pos_operation_inspection_id')->nullable()->constrained()->nullOnDelete();
            $table->dateTime('timestamp_completed')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('inspection_points');
    }
};
