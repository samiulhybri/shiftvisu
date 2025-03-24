<?php

use App\Models\Country;
use App\Models\DeliveryTerm;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->foreignIdFor(DeliveryTerm::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Country::class)->nullable()->constrained()->nullOnDelete();
            $table->string('postal_code')->nullable();
            $table->string('destination')->nullable();
            $table->dropColumn(['is_sap_relevant','is_crm_relevant']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->boolean('is_sap_relevant')->default(false);
            $table->boolean('is_crm_relevant')->default(false);
            $table->dropConstrainedForeignId('delivery_term_id');
            $table->dropConstrainedForeignId('country_id');
            $table->dropColumn('postal_code', 'destination');
        });
    }
};
