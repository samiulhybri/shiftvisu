<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\PackagingInstructionPos;

return new class extends Migration
{
   /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        PackagingInstructionPos::where('packaging_instruction_id', null)->delete();
        PackagingInstructionPos::where('pos', null)->update(['pos' => '']);

        Schema::table('packaging_instruction_pos', function (Blueprint $table) {
            $table->dropForeign(['packaging_instruction_id']);
        });

        Schema::table('packaging_instruction_pos', function (Blueprint $table) {
            $table->string('pos')->nullable(false)->change();
            $table->unsignedBigInteger('packaging_instruction_id')->nullable(false)->change();
            $table->foreign('packaging_instruction_id')
                ->references('id')
                ->on('packaging_instructions')
                ->cascadeOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('packaging_instruction_pos', function (Blueprint $table) {
            $table->dropForeign(['packaging_instruction_id']);
        });

        Schema::table('packaging_instruction_pos', function (Blueprint $table) {
            $table->string('pos')->nullable()->change();
            $table->unsignedBigInteger('packaging_instruction_id')->nullable()->change();
            $table->foreign('packaging_instruction_id')
                ->references('id')
                ->on('packaging_instructions')
                ->nullOnDelete();
        });
    }
};