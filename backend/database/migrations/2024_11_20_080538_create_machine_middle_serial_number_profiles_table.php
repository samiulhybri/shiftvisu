<?php

use App\Models\Machine;
use App\Models\SerialNumberProfile;
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
        Schema::create('machine_middle_serial_number_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Machine::class)->constrained();
            $table->unsignedBigInteger('serial_number_profile_id');
            $table->foreign('serial_number_profile_id', 'machine_middle_serial_number_profiles_snp_foreign')
                ->references('id')
                ->on('serial_number_profiles');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_middle_serial_number_profiles');
    }
};
