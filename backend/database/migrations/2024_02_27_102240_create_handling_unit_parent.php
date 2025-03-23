<?php

use App\Models\HandlingUnit;
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
        Schema::create('handling_unit_parent', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(HandlingUnit::class)->constrained()->cascadeOnDelete();
            $table->foreignId('parent_handling_unit_id')->nullable()->references('id')->on('handling_units')->cascadeOnDelete();
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
        Schema::dropIfExists('handling_unit_parent');
    }
};
