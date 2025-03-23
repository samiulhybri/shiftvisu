<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $this->renameIndex('energy_consumer_machines', 'alternative_unique_index', 'energy_consumer_machines_unique_index');
        $this->renameIndex('energy_impeller_consumptions', 'alternative_unique_index', 'energy_impeller_consumptions_unique_index');
        $this->renameIndex('mp_offers', 'alternative_unique', 'mp_offers_unique_index');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
    }

    /**
     * Rename index.
     *
     * @param  string  $tableName
     * @param  string  $oldIndex
     * @param  string  $newIndex
     * @return void
     */
    protected function renameIndex($tableName, $oldIndex, $newIndex)
    {
        Schema::table($tableName, function (Blueprint $table) use ($tableName, $oldIndex, $newIndex) {
            if (Schema::hasColumn($tableName, $oldIndex)) {
                $table->renameIndex($oldIndex, $newIndex);
            }
        });
    }
};