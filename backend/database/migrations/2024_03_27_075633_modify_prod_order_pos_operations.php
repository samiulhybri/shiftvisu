<?php

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
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\UserGroup::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(\App\Models\User::class)->nullable()->constrained()->nullOnDelete();
            $table->string('operation_code')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(\App\Models\UserGroup::class);
            $table->dropConstrainedForeignIdFor(\App\Models\User::class);
            $table->dropColumn(['operation_code']);
        });
    }
};
