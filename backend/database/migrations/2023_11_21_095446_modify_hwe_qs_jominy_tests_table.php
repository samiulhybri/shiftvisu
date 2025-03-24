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
        Schema::table('hwe_qs_jominy_tests', function (Blueprint $table) {
            $table->dropForeign('hwe_qs_jominy_tests_hwe_qs_sample_id_foreign');
        });

        Schema::table('hwe_qs_jominy_tests', function (Blueprint $table) {
            $table->dropColumn([
                'hwe_qs_sample_id',
                'reh',
                'value_0_5',
                'e_module',
                'rp_rm_ratio'
            ]);
            $table->double('value_40')->nullable();
            $table->double('value_45')->nullable();
            $table->double('value_50')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('hwe_qs_jominy_tests', function (Blueprint $table) {
            $table->foreignId('hwe_qs_sample_id')->nullable()->constrained()->nullOnDelete();
            $table->double('reh')->nullable();
            $table->double('value_0_5')->nullable();
            $table->double('e_module')->nullable();
            $table->double('rp_rm_ratio')->nullable();
            $table->dropColumn([
                'value_40',
                'value_45',
                'value_50'
            ]);
        });
    }
};
