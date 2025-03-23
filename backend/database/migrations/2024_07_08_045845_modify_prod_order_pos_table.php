<?php

use App\Enums\ToolRepairLabelType;
use App\Models\User;
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
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->foreignIdFor(User::class, 'user_id_creator')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(User::class, 'user_id_responsible')->nullable()->constrained()->nullOnDelete();
            $table->float('estimated_hours')->nullable()->default(0.0);
            $table->longText('notes')->nullable();
            $table->string('label')->nullable()->default(ToolRepairLabelType::INTERNAL());
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(User::class, 'user_id_creator');
            $table->dropConstrainedForeignIdFor(User::class, 'user_id_responsible');
            $table->dropColumn('estimated_hours');
            $table->dropColumn('notes');
            $table->dropColumn('label');
        });
    }
};
