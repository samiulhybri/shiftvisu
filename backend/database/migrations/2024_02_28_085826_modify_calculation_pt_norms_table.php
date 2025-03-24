<?php

use App\Models\Calculation;
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
        Schema::dropIfExists('calculation_pt_norms');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('calculation_pt_norms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pt_norms_id');
            $table->foreign('pt_norms_id', 'pt_norms_id_foreign')
                ->references('id')
                ->on('pt_norms')
                ->cascadeOnDelete();
            $table->foreignIdFor(Calculation::class)->unique()->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->string('specification')->nullable();
            $table->string('issue_revision_status')->nullable();
            $table->string('quality_class')->nullable();
            $table->string('test_scope')->nullable();
            $table->string('test_equipment')->nullable();
            $table->string('test_temperature')->nullable();
            $table->string('developer')->nullable();
            $table->string('penetrant')->nullable();
            $table->string('intermediate_cleaner')->nullable();
            $table->double('illuminance_lux')->nullable();
            $table->double('cleaner')->nullable();
            $table->double('registration_limit')->nullable();
            $table->double('control_unit')->nullable();
            $table->double('comments')->nullable();
            $table->double('lux_meter')->nullable();
            $table->double('batch_developer')->nullable();
            $table->double('batch_penetrant')->nullable();
            $table->timestamps();
        });
    }
};
