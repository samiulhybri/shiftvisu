<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hwe_certificate_hwe_qs_samples', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\HweCertificate::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\HweQsSample::class)->constrained()->cascadeOnDelete();
            $table->string('note_qs_sample')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hwe_certificate_hwe_qs_samples');
    }
};
