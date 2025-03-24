<?php

use App\Models\Equipment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->string('custom_id')->nullable()->change();
            $table
                ->foreignIdFor(Equipment::class, "equipment_id_parent")
                ->nullable()
                ->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->string('custom_id')->nullable(false)->change();
            $table->dropConstrainedForeignIdFor(Equipment::class, "equipment_id_parent");
        });
    }
};
