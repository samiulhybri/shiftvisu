<?php

use App\Models\Material;
use App\Models\OfferPos;
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
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->unsignedBigInteger('material_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        OfferPos::whereNull('material_id')->update(['material_id' => Material::first()?->id]);
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->unsignedBigInteger('material_id')->nullable(false)->change();
        });
    }
};
