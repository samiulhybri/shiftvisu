<?php

use App\Models\UnitOfMeasure;
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
        Schema::table('hwe_additional_costs', function (Blueprint $table) {
            $table->string('cost_calc_type')->nullable();
            $table->dropForeign('hwe_additional_costs_unit_of_measure_id_foreign');
            $table->dropColumn('unit_of_measure_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('hwe_additional_costs', function (Blueprint $table) {
            $table->dropColumn('cost_calc_type');
            $table->foreignIdFor(UnitOfMeasure::class)->nullable()->constrained()->nullOnDelete();

        });
    }
};
