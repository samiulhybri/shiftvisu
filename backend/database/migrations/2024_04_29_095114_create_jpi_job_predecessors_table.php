<?php

use App\Models\Model\JpiJob;
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
        Schema::create('jpi_job_predecessors', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(JpiJob::class)->constrained()->cascadeOnDelete();
            $table->foreignId('predecessor_jpi_job_id')->nullable()->references('id')->on('jpi_jobs')->nullOnDelete();
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
        Schema::dropIfExists('jpi_job_predecessors');
    }
};
