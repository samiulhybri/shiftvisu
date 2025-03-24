<?php

use App\Models\HweQsUsNorm;
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
        Schema::create('hwe_qs_us_norm_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(HweQsUsNorm::class)->constrained()->cascadeOnDelete();
            $table->string('adjustment');
            $table->index(['hwe_qs_us_norm_id', 'adjustment']);
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
        Schema::dropIfExists('hwe_qs_us_norm_adjustments');
    }
};
