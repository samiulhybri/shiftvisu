<?php

use App\Models\Country;
use App\Models\DeliveryTerm;
use App\Models\PaymentTerm;
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
            $table->string('name2')->nullable();
            $table->string('address')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('city')->nullable();
            $table->foreignIdFor(Country::class)->nullable()->constrained()->nullOnDelete();
            $table->string('telephone')->nullable();
            $table->string('vat')->nullable();
            $table->double('total_insured')->nullable();
            $table->double('total_production')->nullable();
            $table->double('total_outstanding')->nullable();
            $table->double('total_revenue')->nullable();
            $table->foreignIdFor(DeliveryTerm::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(PaymentTerm::class)->nullable()->constrained()->nullOnDelete();
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
            $table->dropConstrainedForeignId('country_id');
            $table->dropConstrainedForeignId('delivery_term_id');
            $table->dropConstrainedForeignId('payment_term_id');

            $table->dropColumn([
                'name2',
                'address',
                'postal_code',
                'city',
                'vat',
                'telephone',
                'total_insured',
                'total_production',
                'total_outstanding',
                'total_revenue',
            ]);
        });
    }
};
