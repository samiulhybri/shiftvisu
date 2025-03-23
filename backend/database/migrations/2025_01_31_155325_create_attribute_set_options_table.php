<?php

use App\Models\AttributeSet;
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
        Schema::create('attribute_set_options', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(AttributeSet::class)->constrained();
            $table->string('custom_id');
            $table->unique(['attribute_set_id', 'custom_id']);
            $table->string('valuation');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_set_options');
    }
};
