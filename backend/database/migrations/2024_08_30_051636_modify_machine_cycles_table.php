<?php

use App\Models\ProdOrderPosOperation;
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
        Schema::table('machine_cycles', function (Blueprint $table) {
            //
            $table->foreignIdFor(ProdOrderPosOperation::class)->nullable()->constrained()->nullOnDelete();
            $table->string("serial")->nullable();
            $table->string("batch")->nullable();
            $table->dateTime("confirmed_datetime")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('machine_cycles', function (Blueprint $table) {
            //
            $table->dropConstrainedForeignId(ProdOrderPosOperation::class);
            $table->dropColumn(["serial", "batch", "confirmed_datetime"]);
        });
    }
};
