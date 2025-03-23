<?php

use App\Models\ProdOrderPos;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hwe_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdOrderPos::class, 'prod_order_pos_id_qs_samples')->unique()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(ProdOrderPos::class, 'prod_order_pos_id_ultrasonic')->nullable()->constrained()->nullOnDelete();
            $table->string('note_ultrasonic')->nullable();
            $table->foreignIdFor(ProdOrderPos::class, 'prod_order_pos_id_surface')->nullable()->constrained()->nullOnDelete();
            $table->string('note_surface')->nullable();
            $table->foreignIdFor(ProdOrderPos::class, 'prod_order_pos_id_heat_treatment')->nullable()->constrained()->nullOnDelete();
            $table->string('note_heat_treatment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hwe_certificates');
    }
};
