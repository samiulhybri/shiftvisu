<?php

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
        Schema::create('prod_inspection_operation_characteristic_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prod_inspection_operation_characteristic_id')->constrained(indexName: 'option_characteristic_foreign');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prod_inspection_operation_characteristic_options');
    }
};
