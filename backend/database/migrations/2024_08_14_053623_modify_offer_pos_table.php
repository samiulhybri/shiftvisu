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
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\OfferPos::class, 'offer_pos_id_copy_from')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(\App\Models\OfferPos::class,'offer_pos_id_copy_from');
        });
    }
};
