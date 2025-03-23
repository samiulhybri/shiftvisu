<?php

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
        Schema::table('inspection_operation_characteristics', function (Blueprint $table) {
            $table->foreignIdFor(UserGroup::class)->nullable()->constrained();
            $table->boolean('is_required')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspection_operation_characteristics', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(UserGroup::class);
            $table->dropColumn(['is_required']);
        });
    }
};
