<?php

use App\Models\Hall;
use App\Models\ShiftVisu\ShiftVisuIssueType;
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
        Schema::create('hall_shift_visu_issue_type', function (Blueprint $table) {
            $table->foreignIdFor(Hall::class);
            $table->foreignIdFor(ShiftVisuIssueType::class);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hall_shift_visu_issue_type');
    }
};
