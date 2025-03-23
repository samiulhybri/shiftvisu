<?php

use App\Models\ProdInspectionOperation;
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
        Schema::table('inspection_points', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(ProdInspectionOperation::class);
            $table->morphs('inspectable');
            $table->boolean('is_automatically_triggered');
            $table->foreignIdFor(User::class, 'user_id_creator')->nullable()->constrained()->nullOnDelete();
            $table->dateTime('registered_datetime');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspection_points', function (Blueprint $table) {
            $table->foreignIdFor(ProdInspectionOperation::class)->constrained();
        });
    }
};
