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
        Schema::table('qualifications', function (Blueprint $table) {
            $table->dropForeign(['item_id']);
            $table->foreignIdFor(\App\Models\Item::class)->nullable()->change();
            $table->foreign('item_id')->references('id')->on('items')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('qualifications', function (Blueprint $table) {
            $table->dropForeign(['item_id']);
            $table->foreignIdFor(\App\Models\Item::class)->nullable(false)->change();
            $table->foreign('item_id')->references('id')->on('items')->cascadeOnDelete();
        });
    }
};
