<?php

use App\Enums\MachineBoardType;
use App\Enums\MachineConfirmationType;
use App\Enums\MachineStateType;
use App\Enums\ProductionPlanType;
use App\Enums\StatusBoardCardType;
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
        Schema::table('machines', function (Blueprint $table) {
            $table->string('status_board_card_type')->default(StatusBoardCardType::VIEW_1());
            $table->string('machine_board_type')->default(MachineBoardType::VIEW_1());
            $table->string('production_plan_type')->default(ProductionPlanType::MANUAL());
            $table->string('confirmation_type')->default(MachineConfirmationType::MANUAL());
            $table->string('has_operation_pool')->default(false);
            $table->string('machine_state_type')->default(MachineStateType::MANUAL());
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropColumn(['status_board_card_type',
                'machine_board_type',
                'production_plan_type',
                'confirmation_type',
                'has_operation_pool',
                'machine_state_type'
                ]);
        });
    }
};
