<?php

use App\Models\Machine;
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
        Schema::table('marker_recipes', function (Blueprint $table) {
            $table->foreignIdFor(Machine::class)->nullable()->constrained()->nullOnDelete();
            $table->integer('delay')->nullable()->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('marker_recipes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('machine_id');
            $table->dropColumn('delay');
        });
    }
};
