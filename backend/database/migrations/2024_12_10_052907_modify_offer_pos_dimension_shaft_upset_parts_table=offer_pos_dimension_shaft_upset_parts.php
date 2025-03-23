<?php

use App\Models\OfferPosDimensionShaftUpsetPart;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
            $table->double('length')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        OfferPosDimensionShaftUpsetPart::whereNull('length')->update(['length' => 0]); // change null to 0 for prevent rollback issue
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
             $table->double('length')->nullable(false)->change();

        });
    }
};
