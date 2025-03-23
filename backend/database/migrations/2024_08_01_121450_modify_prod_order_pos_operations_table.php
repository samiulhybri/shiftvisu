<?php

use App\Models\OperationControlProfile;
use App\Models\Plant;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->foreignIdFor(Plant::class, 'plant_id_production')
                ->nullable()->constrained();
            $table->double("quantity")->default(0);

            $table->foreignIdFor(OperationControlProfile::class)
                ->nullable()->constrained();
            $table->foreignIdFor(UnitOfMeasure::class)
                ->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Plant::class, 'plant_id_production');
            $table->dropColumn('quantity');
            $table->dropConstrainedForeignIdFor(OperationControlProfile::class);
            $table->dropConstrainedForeignIdFor(UnitOfMeasure::class);
        });
    }
};
