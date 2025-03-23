<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('calculation_non_destructive_norms', function (Blueprint $table) {
            $table->dropForeign('calculation_non_destructive_testing_id_foreign_key');
        });

        Schema::table('calculation_non_destructive_norms', function (Blueprint $table) {
            $table->foreign('calculation_non_destructive_testing_id', 'calculation_non_destructive_testing_id_foreign_key')
                ->references('id')
                ->on('calculation_non_destructive_testings')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::table('calculation_non_destructive_norms', function (Blueprint $table) {
            $table->dropForeign('calculation_non_destructive_testing_id_foreign_key');
        });

        Schema::table('calculation_non_destructive_norms', function (Blueprint $table) {

            $table->foreign('calculation_non_destructive_testing_id', 'calculation_non_destructive_testing_id_foreign_key')
                ->references('id')
                ->on('calculation_non_destructive_norms')
                ->cascadeOnDelete();
        });
    }
};
