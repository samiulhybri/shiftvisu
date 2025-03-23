<?php

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
        Schema::table('doc_visu_files', function (Blueprint $table) {
            $table->boolean('is_trainable')->default(true);
            $table->boolean('is_releasable')->default(false);
            $table->boolean('is_released')->default(false);
            $table->foreignIdFor(User::class, 'user_id_released_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('released_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doc_visu_files', function (Blueprint $table) {
            $table->dropColumn('is_trainable');
            $table->dropColumn('is_releasable');
            $table->dropColumn('is_released');
            $table->dropForeign(['user_id_released_by']);
            $table->dropColumn('user_id_released_by');
            $table->dropColumn('released_date');
        });
    }
};
