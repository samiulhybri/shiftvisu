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
            $table->foreignId('metallography_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('testing_scope_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('non_destructive_testing_id')->nullable()->constrained()->nullOnDelete();
            $table->dropForeign('calculations_mt_spec_id_foreign');
            $table->dropColumn('mt_spec_id');
            $table->dropForeign('calculations_specification_id_foreign');
            $table->dropColumn('specification_id');
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
            $table->dropForeign('calculations_metallography_id_foreign');
            $table->dropColumn('metallography_id');
            $table->dropForeign('calculations_testing_scope_id_foreign');
            $table->dropColumn('testing_scope_id');
            $table->dropForeign('calculations_non_destructive_testing_id_foreign');
            $table->dropColumn('non_destructive_testing_id');
            $table->foreignId('mt_spec_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('specification_id')->nullable()->constrained()->nullOnDelete();
        });
    }
};
