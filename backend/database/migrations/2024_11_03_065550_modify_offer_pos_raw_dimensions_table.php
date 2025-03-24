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
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\Machine::class, 'machine_id_3')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(\App\Models\Machine::class, 'machine_id_4')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('machine_id_3');
            $table->dropConstrainedForeignId('machine_id_4');
        });
    }
};
