<?php

use App\Models\Machine;
use App\Models\MachineState;
use App\Models\ProdOrderPosOperation;
use App\Models\StandardValueKeyActivityType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('machine_registered_times', function (Blueprint $table) {
            $table->id();

            $table->foreignIdFor(ProdOrderPosOperation::class)->nullable()->constrained();
            $table->foreignIdFor(Machine::class)->nullable()->constrained();
            $table->double('hours_split');
            $table->foreignIdFor(MachineState::class)->nullable()->constrained();
            $table->string('status_operation')->nullable();
            $table->dateTime('start')->nullable();
            $table->dateTime('end')->nullable();
            $table->foreignIdFor(StandardValueKeyActivityType::class)
                ->nullable()->constrained(indexName: 'machine_registered_times_svk_activity_type_id_foreign');
            $table->boolean("is_generated")->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_registered_times');
    }
};
