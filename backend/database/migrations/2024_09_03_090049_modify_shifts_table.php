<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table("shifts")->whereNull("break_minutes")->update(["break_minutes" => 0]);

        Schema::table('shifts', function (Blueprint $table) {
            $table->integer('break_minutes')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shifts', function (Blueprint $table) {
            $table->integer('break_minutes')->nullable()->change();
        });
    }
};
