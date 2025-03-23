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
        Schema::table('jpi_resource_groups', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(\App\Models\Model\JpiResourceCategory::class);
        });

        Schema::table('jpi_resource_groups', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\Model\JpiResourceCategory::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jpi_resource_groups', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(\App\Models\Model\JpiResourceCategory::class);
        });
        Schema::table('jpi_resource_groups', function (Blueprint $table) {
            $table->foreignId('jpi_resource_category_id')->references('id')->on('jpi_resource_categories')->cascadeOnDelete();
        });
    }
};
