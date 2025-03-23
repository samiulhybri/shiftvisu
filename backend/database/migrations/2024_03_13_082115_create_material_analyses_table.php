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
        Schema::create('material_analyses', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->foreignIdFor(\App\Models\Material::class)->constrained()->cascadeOnDelete();
            $table->string('regulation')->nullable();
            $table->string('issue_revision');
            $table->string('mq_quality')->nullable();
            $table->string('me_quality')->nullable();
            $table->boolean('is_classified_steel_plant')->default(false);
            $table->boolean('is_eu_material')->default(false);
            $table->string('note')->nullable();

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
        Schema::dropIfExists('material_analyses');
    }
};
