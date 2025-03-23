<?php

use App\Models\MpOffer;
use App\Models\User;
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
        Schema::create('mp_offer_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(MpOffer::class)->nullable()->constrained()->nullOnDelete();
            $table->string("description")->nullable();
            $table->foreignIdFor(User::class)->nullable()->constrained()->nullOnDelete();
            $table->timestamp("log_date")->useCurrent();
            $table->string("project_order")->nullable();
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
        Schema::dropIfExists('mp_offer_logs');
    }
};
