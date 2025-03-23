<?php

use App\Enums\TrainingStatus;
use App\Models\PersonalVisu\Training;
use App\Models\User;
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
        Schema::create('training_trainees', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Training::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'user_id_trainee')->constrained()->cascadeOnDelete();
            $table->boolean('mail')->default(false);
            $table->string('status')->default(TrainingStatus::CREATED());
            $table->unique(['user_id_trainee', 'training_id'], 'unique_trainee_training');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('training_trainees', function (Blueprint $table) {
            $table->dropForeign(['user_id_trainee']);
            $table->dropUnique('unique_trainee_training');
        });
        Schema::dropIfExists('training_trainees');
    }
};
