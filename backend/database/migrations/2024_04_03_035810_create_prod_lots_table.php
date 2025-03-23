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
        Schema::create('prod_lots', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->dateTime('start')->nullable();
            $table->dateTime('end')->nullable();
            $table->foreignIdFor(Machine::class)->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('prod_lots');
    }
};
