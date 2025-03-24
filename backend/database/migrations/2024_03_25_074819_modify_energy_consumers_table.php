<?php

use App\Models\EnergyConsumerGroup;
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
        Schema::table('energy_consumers', function (Blueprint $table) {
            $table->foreignIdFor(EnergyConsumerGroup::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('energy_consumers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('energy_consumer_group_id');
        });
    }
};
