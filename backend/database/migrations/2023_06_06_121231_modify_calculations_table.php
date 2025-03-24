<?php

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
        Schema::table('calculations', function (Blueprint $table) {
            $table->foreignId('documentation_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('mt_spec_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('us_norm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('mt_norm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pt_norm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vt_norm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('residual_material_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('calculations', function (Blueprint $table) {
            $table->dropForeign('calculations_documentation_id_foreign');
            $table->dropColumn('documentation_id');
            $table->dropForeign('calculations_mt_spec_id_foreign');
            $table->dropColumn('mt_spec_id');
            $table->dropForeign('calculations_us_norm_id_foreign');
            $table->dropColumn('us_norm_id');
            $table->dropForeign('calculations_mt_norm_id_foreign');
            $table->dropColumn('mt_norm_id');
            $table->dropForeign('calculations_pt_norm_id_foreign');
            $table->dropColumn('pt_norm_id');
            $table->dropForeign('calculations_vt_norm_id_foreign');
            $table->dropColumn('vt_norm_id');
            $table->dropForeign('calculations_residual_material_id_foreign');
            $table->dropColumn('residual_material_id');
        });
    }
};
