<?php

use Doctrine\DBAL\Schema\Column;
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
            for ($i = 1; $i <= 18; $i++) {
                $table->double('class_' . $i)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_melt_analyses', function (Blueprint $table) {
            for ($i = 1; $i <= 18; $i++) {
                $table->dropColumn('class_' . $i);
            }
        });
    }
};
