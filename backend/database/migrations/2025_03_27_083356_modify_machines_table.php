<?php

use App\Enums\MachineQualificationImportType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->string('qualification_import_type')->default(MachineQualificationImportType::NONE);
            $table->double('default_qualification_hours')->default(0);
            $table->double('default_qualification_operations')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropColumn(['qualification_import_type', 'default_qualification_hours', 'default_qualification_operations']);
        });
    }
};
