<?php

use App\Enums\TrainingStatus;
use App\Models\PersonalVisu\Training;
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
        Schema::create('training_workspaces', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Training::class)->constrained()->cascadeOnDelete();
            $table->morphs('workspace');
            $table->string('status')->default(TrainingStatus::CREATED());
            $table->integer('interval_seconds')->nullable();
            $table->unique(['training_id', 'workspace_id', 'workspace_type'], 'unique_workspace_training');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('training_workspaces', function (Blueprint $table) {
            $table->dropForeign(['training_id']);
            $table->dropUnique('unique_workspace_training');
        });
        Schema::dropIfExists('training_workspaces');
    }
};
