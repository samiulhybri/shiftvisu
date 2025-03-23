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
        Schema::table('machine_groups', function (Blueprint $table) {
            $table->foreignId('hall_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(\App\Models\CostCenter::class)->nullable()->constrained()->nullOnDelete();
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
            $table->dropForeign('machine_groups_hall_id_foreign');
            $table->dropForeign('machine_groups_cost_center_id_foreign');
            $table->dropColumn(['cost_center_id', 'hall_id']);
        });
    }
};
