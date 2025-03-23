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
        Schema::table('sales_opportunities', function (Blueprint $table) {
            $table->dropColumn(['sales_group', 'sales_department']);
            $table->foreignIdFor(SalesGroup::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(SalesArea::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sales_opportunities', function (Blueprint $table) {
            $table->string('sales_department')->nullable();
            $table->string('sales_group')->nullable();
            $table->dropConstrainedForeignIdFor(SalesGroup::class);
            $table->dropConstrainedForeignIdFor(SalesArea::class);
        });
    }
};
