<?php

use App\Models\MaterialAnalysis;
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
        Schema::table('hwe_melt_analyses', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Supplier::class);
            $table->foreignIdFor(MaterialAnalysis::class)->nullable()->constrained()->nullOnDelete();
            $table->string('melting_type')->nullable();
            $table->string('quality_6336_5')->nullable();
            $table->string('purchase_order')->nullable();
            $table->string('purchase_order_pos')->nullable();
            $table->double('element_as')->nullable();
            $table->double('element_as_hwe')->nullable();
            $table->double('element_ta')->nullable();
            $table->double('element_ta_hwe')->nullable();
            $table->double('element_sb')->nullable();
            $table->double('element_sb_hwe')->nullable();
            $table->double('element_zr')->nullable();
            $table->double('element_zr_hwe')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_melt_analyses', function (Blueprint $table) {
            $table->foreignIdFor(Supplier::class)->nullable()->constrained()->nullOnDelete();
            $table->dropConstrainedForeignId(MaterialAnalysis::class);
            $table->dropColumn('melting_type');
            $table->dropColumn('quality_6336_5');
            $table->dropColumn('purchase_order');
            $table->dropColumn('purchase_order_pos');
            $table->dropColumn('element_as');
            $table->dropColumn('element_as_hwe');
            $table->dropColumn('element_ta');
            $table->dropColumn('element_ta_hwe');
            $table->dropColumn('element_sb');
            $table->dropColumn('element_sb_hwe');
            $table->dropColumn('element_zr');
            $table->dropColumn('element_zr_hwe');
        });
    }
};
