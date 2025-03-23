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
        Schema::dropIfExists('material_melting_types');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('material_melting_types', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Material::class)->constrained()->cascadeOnDelete();
            $table->string('melting_type');
            $table->index(['material_id','melting_type']);
            $table->timestamps();
        });
    }
};
