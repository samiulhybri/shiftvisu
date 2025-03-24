<?php

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
        Schema::table('us_norms', function (Blueprint $table) {
            $table->dropColumn(['sound_attenuation',
                'test_of_scope',
            ]);
        });
        Schema::dropIfExists('us_norm_probes');
        Schema::dropIfExists('us_norm_test_directions');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('us_norms', function (Blueprint $table) {
            $table->string('test_of_scope')->nullable();
            $table->double('sound_attenuation')->nullable();
        });
        Schema::create('us_norm_probes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('us_norm_id')->constrained()->cascadeOnDelete();
            $table->string('probe');
            $table->index(['us_norm_id', 'probe']);
            $table->timestamps();
        });

        Schema::create('us_norm_test_directions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('us_norm_id')->constrained()->cascadeOnDelete();
            $table->string('test_direction');
            $table->index(['us_norm_id', 'test_direction']);
            $table->timestamps();
        });

    }
};
