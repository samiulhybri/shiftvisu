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
        Schema::create('sales_opportunities', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('contact_person')->nullable();
            $table->string('sales_department')->nullable();
            $table->string('sales_group')->nullable();
            $table->date('request_date')->nullable();
            $table->date('offer_until_date')->nullable();
            $table->string('customer_reference')->nullable();
            $table->string('type')->nullable();
            $table->string('additional_info')->nullable();
            $table->string('changes')->nullable();
            $table->boolean('is_short_offer')->default(false);
            $table->boolean('is_specification_necessary')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sales_opportunities');
    }
};
