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
        Schema::table('machine_user_times', function (Blueprint $table) {
            $table->foreignIdFor(StandardValueKeyActivityType::class)->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machine_user_times', function (Blueprint $table) {
            $table->dropConstrainedForeignId('standard_value_key_activity_type_id');
        });
    }
};
