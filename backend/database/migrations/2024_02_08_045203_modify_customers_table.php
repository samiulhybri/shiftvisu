<?php

use App\Models\SalesArea;
use App\Models\SalesGroup;
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
            $table->foreignIdFor(SalesArea::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(SalesGroup::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $sales = new SalesArea();
        Schema::table('customers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sales_area_id');
            $table->dropConstrainedForeignId('sales_group_id');
        });
    }
};
