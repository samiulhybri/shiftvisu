<?php

use App\Models\Calculation;
use App\Models\Metallography;
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
        Schema::create('calculation_metallographies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('metallography_id');
            $table->foreign('metallography_id', 'metallography_id_foreign')
                ->references('id')
                ->on('metallographies')
                ->cascadeOnDelete();
            $table->foreignIdFor(Calculation::class)->unique()->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->string('regulation')->nullable();
            $table->string('issue_revision')->nullable();
            $table->string('grain_size')->nullable();
            $table->string('grain_size_after_carburizing')->nullable();
            $table->string('grain_size_determination_according_to')->nullable();
            $table->string('grain_size_textfield')->nullable();
            $table->string('cleanliness_determination_according_to')->nullable();
            $table->string('cleanliness_determination')->nullable();
            $table->string('cleanliness_50602_astma45_sep1570')->nullable();
            $table->string('cleanliness_iso4967_nfa04_106')->nullable();
            $table->string('cleanliness_textfield')->nullable();
            $table->double('a_fine')->nullable();
            $table->double('a_coarse')->nullable();
            $table->double('b_fine')->nullable();
            $table->double('b_coarse')->nullable();
            $table->double('c_fine')->nullable();
            $table->double('c_coarse')->nullable();
            $table->double('d_fine')->nullable();
            $table->double('d_coarse')->nullable();
            $table->double('ds')->nullable();
            $table->boolean('image')->default(false);
            $table->boolean('needs_microsection_structure')->default(false);
            $table->boolean('needs_microsection_grain_size')->default(false);
            $table->boolean('needs_microsection_carburized')->default(false);
            $table->boolean('needs_microsection_cleanliness')->default(false);
            $table->string('microstructure_assessment')->nullable();
            $table->string('microstructure_quota')->nullable();
            $table->double('microstructure_max_quota')->nullable();
            $table->string('microstructure_textfield')->nullable();
            $table->string('needs_ic_according_to')->nullable();
            $table->boolean('needs_ic_simulation_annealing')->default(false);
            $table->boolean('needs_ic_external_testing')->default(false);
            $table->string('needs_ic_textfield')->nullable();
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
        Schema::dropIfExists('calculation_metallographies');
    }
};
