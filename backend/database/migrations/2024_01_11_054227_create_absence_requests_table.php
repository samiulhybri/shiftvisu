<?php

use App\Models\AbsenceType;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('absence_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(AbsenceType::class)->nullable()->constrained()->nullOnDelete();
            $table->dateTime('start');
            $table->dateTime('end');
            $table->double('total_hour')->nullable();
            $table->string('status');
            $table->foreignId('approved_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('applicant_note')->nullable();
            $table->string('supervisor_note')->nullable();
            $table->dateTime('approval_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::dropIfExists('absence_requests');
    }
};
