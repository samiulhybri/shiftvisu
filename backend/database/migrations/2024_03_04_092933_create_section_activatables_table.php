<?php

use App\Enums\SectionActivatableTypes;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('section_activatables', function (Blueprint $table) {
            $table->id();
            $table->morphs('activatable');
            $table->string('section')->default(SectionActivatableTypes::SHOPFLOOR());
            $table->boolean('is_active')->default(false);
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
        Schema::dropIfExists('section_activatables');
    }
};
