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
        Schema::table('items', function (Blueprint $table) {
            $table->dropUnique('items_custom_id_unique');
            $table->foreignIdFor(\App\Models\Plant::class)->nullable()->constrained()->cascadeOnDelete();
            $table->unique(['custom_id', 'plant_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(\App\Models\Plant::class);
        });
    }
};
