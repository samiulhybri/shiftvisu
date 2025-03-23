<?php

use App\Models\CustomerGroup;
use App\Models\Sector;
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
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignIdFor(Sector::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(CustomerGroup::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sector_id');
            $table->dropConstrainedForeignId('customer_group_id');
        });
    }
};
