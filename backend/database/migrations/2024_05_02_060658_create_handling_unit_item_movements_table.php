<?php

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
        Schema::create('handling_unit_item_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\HandlingUnitItem::class)->constrained();
            $table->double('quantity')->nullable();
            $table->boolean('is_exported')->default(false);
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
        Schema::dropIfExists('handling_unit_item_movements');
    }
};
