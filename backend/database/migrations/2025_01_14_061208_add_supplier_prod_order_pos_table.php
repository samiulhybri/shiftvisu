<?php

use App\Models\Supplier;
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
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->foreignIdFor(Supplier::class, 'supplier_id_tool')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Supplier::class,'supplier_id_tool');
        });
    }
};
