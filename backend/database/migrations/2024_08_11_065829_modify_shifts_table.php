<?php

use App\Enums\ShiftDate;
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
        Schema::table('shifts', function (Blueprint $table) {
            $table->dropColumn(['hours', 'is_capacity_relevant', 'date_to_consider']);
            $table->dropConstrainedForeignId('shift_model_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('shifts', function (Blueprint $table) {
            $table->double('hours')->default(0);
            $table->boolean('is_capacity_relevant');
            $table->string('date_to_consider')->default(ShiftDate::SAMEDAY());
            $table->foreignId('shift_model_id')->constrained()->cascadeOnDelete();
        });
    }
};
