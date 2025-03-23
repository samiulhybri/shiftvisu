<?php

use App\Models\ShiftVisu\ShiftVisuComponent;
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
        Schema::create('shift_visu_issue_type_shift_visu_components', function (Blueprint $table) {
            $table->foreignIdFor(ShiftVisuIssueType::class);
            $table->foreignIdFor(ShiftVisuComponent::class);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_visu_issue_type_shift_visu_components');
    }
};
