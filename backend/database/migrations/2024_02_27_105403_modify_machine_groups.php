<?php

use App\Models\StagingArea;
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
        Schema::table('machine_groups', function (Blueprint $table) {
            $table->foreignIdFor(StagingArea::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('machine_groups', function (Blueprint $table) {
            $table->dropForeign('machine_groups_staging_area_id_foreign');
            $table->dropColumn('staging_area_id');
        });
    }
};
