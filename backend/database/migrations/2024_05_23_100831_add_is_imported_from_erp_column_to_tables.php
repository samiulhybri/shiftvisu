<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * List of tables to be updated.
     *
     * @var array
     */
    protected $tables = [
        'bad_part_reasons',
        'crucibles',
        'customer_groups',
        'customers',
        'machines',
        'machine_groups',
        'tpm_groups',
        'tpm_sub_groups',
        'machine_states',
        'machine_state_groups',
        'items',
        'item_groups',
        'tools',
        'users',
        'user_groups',
        'qualifications',
        'halls',
        'sales_groups',
        'suppliers',
        'energy_gateways',
        'energy_consumers',
        'energy_consumer_groups'
    ];

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->boolean('is_imported_from_erp')->default(false);
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn('is_imported_from_erp');
            });
        }
    }
};
