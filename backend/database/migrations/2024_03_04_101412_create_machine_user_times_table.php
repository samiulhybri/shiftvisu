<?php

use App\Models\Machine; 
use App\Models\User;
use App\Models\Shift;
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
        Schema::create('machine_user_times', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Machine::class)->constrained();
            $table->foreignIdFor(User::class)->constrained();
            $table->foreignIdFor(Shift::class)->nullable()->constrained()->nullOnDelete();
            $table->dateTime('start')->useCurrent();
            $table->dateTime('end')->nullable();
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
        Schema::dropIfExists('machine_user_times');
    }
};
