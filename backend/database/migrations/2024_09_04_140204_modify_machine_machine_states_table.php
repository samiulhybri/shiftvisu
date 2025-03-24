<?php

use App\Models\StandardValueKeyActivityType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('machine_machine_states', function (Blueprint $table) {
            $table->foreignIdFor(StandardValueKeyActivityType::class,
            )->nullable()->constrained(indexName: 'machine_machine_states_svk_at_id_foreign');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machine_machine_states', function (Blueprint $table) {
            $table->dropForeign('machine_machine_states_svk_at_id_foreign');
            $table->dropColumn('standard_value_key_activity_type_id');
        });
    }
};
