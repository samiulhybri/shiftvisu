<?php

use App\Enums\TrainingStatus;
use App\Enums\TrainingType;
use App\Models\User;
use App\Models\UserGroup;
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
        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->morphs('trainable'); // DocVisuFile or anything can be trained
            $table->foreignIdFor(User::class, 'user_id_trainer')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default(TrainingStatus::CREATED());
            $table->string('type')->default(TrainingType::STANDARD());
            $table->timestamp('due_date_time')->nullable();
            $table->unique(['user_id_trainer', 'trainable_id', 'trainable_type'], 'unique_training');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainings', function (Blueprint $table) {
            $table->dropForeign(['user_id_trainer']);
            $table->dropUnique('unique_training');
        });
        Schema::dropIfExists('trainings');
    }
};
