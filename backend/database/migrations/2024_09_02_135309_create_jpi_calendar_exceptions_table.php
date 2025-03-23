<?php

use App\Models\Model\JpiResource;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jpi_calendar_exceptions', function (Blueprint $table) {
            $table->id();

            $table->foreignIdFor(JpiResource::class)->constrained();
            $table->date('date');
            $table->string('work_time');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jpi_calendar_exceptions');
    }
};
