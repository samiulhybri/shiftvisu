<?php

use App\Models\UsNorm;
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
        Schema::create('us_norm_test_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(UsNorm::class)->constrained()->cascadeOnDelete();
            $table->string('test_section')->nullable();
            $table->double('registration_threshold')->nullable();
            $table->double('reporting_threshold')->nullable();
            $table->double('decision_threshold')->nullable();
            $table->double('allowed_threshold')->nullable();
            $table->double('expansion_with')->nullable();
            $table->double('expansion_without')->nullable();
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
        Schema::dropIfExists('us_norm_test_sections');
    }
};
