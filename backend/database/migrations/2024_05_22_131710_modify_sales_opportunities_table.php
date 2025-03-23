<?php

use App\Models\Country;
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
            $table->foreignIdFor(Country::class)->nullable()->constrained()->nullOnDelete();
            $table->string('postal_code')->nullable();
            $table->string('destination')->nullable();
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
            $table->dropConstrainedForeignIdFor(Country::class);
            $table->dropColumn('postal_code', 'destination');
        });
    }
};
