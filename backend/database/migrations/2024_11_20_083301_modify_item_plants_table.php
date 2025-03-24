<?php

use App\Models\SerialNumberProfile;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('item_plants', function (Blueprint $table) {
            $table->dropColumn('serial_managed_mode');
            $table->foreignIdFor(SerialNumberProfile::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_plants', function (Blueprint $table) {
            $table->string('serial_managed_mode')->nullable()->default(null);
            $table->dropConstrainedForeignIdFor(SerialNumberProfile::class);
        });
    }
};