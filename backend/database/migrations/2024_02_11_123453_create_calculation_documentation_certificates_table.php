<?php

use App\Models\CalculationDocumentation;
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
        Schema::create('calculation_documentation_certificates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_documentation_id');
            $table->foreign('calculation_documentation_id', 'calculation_documentation_id_foreign')
                ->references('id')
                ->on('calculation_documentations')
                ->cascadeOnDelete();
            $table->string('certificate');
            $table->index(['calculation_documentation_id', 'certificate'], 'calculation_documentation_certificate_unique_index');
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
        Schema::dropIfExists('calculation_documentation_certificates');
    }
};
