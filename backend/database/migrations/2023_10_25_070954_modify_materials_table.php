<?php

use App\Models\Material;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Material::whereNull('name')->update(['name' => '']);
        Material::whereNull('density')->update(['density' => 0.0]);
        Material::whereNull('material_group_type')->update(['material_group_type' => '']);
        Material::whereNull('warehouse_material')->update(['warehouse_material' => '']);

        Schema::table('materials', function (Blueprint $table) {
            $table->string('name')->nullable(false)->change();
            $table->double('density')->nullable(false)->change();
            $table->string('material_group_type')->nullable(false)->change();
            $table->string('warehouse_material')->nullable(false)->change();
            $table->string('with_applicable_standard')->nullable()->change();
            $table->string('mq_quality')->nullable()->change();
            $table->string('me_quality')->nullable()->change();
            $table->string('chem_text_field')->nullable()->change();
            $table->string('is_text_field')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
            $table->double('density')->nullable()->change();
            $table->string('material_group_type')->nullable()->change();
            $table->string('warehouse_material')->nullable()->change();
            $table->string('with_applicable_standard')->nullable(false)->change();
            $table->string('mq_quality')->nullable(false)->change();
            $table->string('me_quality')->nullable(false)->change();
            $table->string('chem_text_field')->nullable(false)->change();
            $table->string('is_text_field')->nullable(false)->change();
        });
    }
};
