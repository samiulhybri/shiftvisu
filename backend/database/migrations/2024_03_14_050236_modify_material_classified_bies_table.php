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
        Schema::dropIfExists('material_classified_bies');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('material_classified_bies', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Material::class)->constrained()->cascadeOnDelete();
            $table->string('classified_by');
            $table->index(['material_id','classified_by']);
            $table->timestamps();
        });
    }
};
