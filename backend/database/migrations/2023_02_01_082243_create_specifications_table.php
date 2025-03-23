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
        Schema::create('specifications', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->foreignId('norm_id')->nullable()->constrained()->nullOnDelete();
            $table->string('specification_note')->nullable();
            $table->longText('note')->nullable();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('bom')->nullable();
            $table->boolean('is_electric_steel')->default(false);
            $table->boolean('is_vacuum_degassed')->default(false);
            $table->boolean('is_classified_steel_plant')->default(false);
            $table->boolean('is_casting_beam_shielded')->default(false);
            $table->boolean('is_deoxidized')->default(false);
            $table->boolean('is_killed_steel')->default(false);
            $table->string('jominy_batch')->nullable();
            $table->string('continuous_casting')->nullable();
            $table->string('ingot_casting')->nullable();
            $table->string('deformation')->nullable();
            $table->string('stretch_forging_degree')->nullable();
            $table->boolean('check_stock')->default(false);
            $table->string('KSR_max')->nullable();
            $table->string('attestation')->nullable();
            $table->string('attestation_entity')->nullable();
            $table->string('non_destructive_testing')->nullable();
            $table->string('frequency')->nullable();
            $table->string('specimen_material')->nullable();
            $table->string('specimen_rest_material')->nullable();
            $table->integer('WZV_temperature')->nullable();
            $table->double('zug')->nullable();
            $table->double('kbz')->nullable();
            $table->double('wzv')->nullable();
            $table->boolean('needs_jominy_face_quenching_test')->default(false);
            $table->boolean('needs_ic_3651_2_method_a')->default(false);
            $table->boolean('needs_ic_3651_1')->default(false);
            $table->boolean('needs_ic_a262_practice_e')->default(false);
            $table->boolean('product_analysis')->default(false);
            $table->boolean('needs_microsection_structure')->default(false);
            $table->boolean('needs_microsection_grain_size')->default(false);
            $table->boolean('needs_microsection_carburized')->default(false);
            $table->boolean('needs_microsection_cleanliness')->default(false);
            $table->string('grain_size')->nullable();
            $table->boolean('is_50601')->default(false);
            $table->boolean('astm_e112')->default(false);
            $table->boolean('iso_643')->default(false);
            $table->string('grain_size_after_carburizing')->nullable();
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
        Schema::dropIfExists('specifications');
    }
};
