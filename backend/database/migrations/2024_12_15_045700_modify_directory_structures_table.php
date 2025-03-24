<?php

use App\Models\DocVisu\DirectoryStructure;
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
        Schema::table('directory_structures', function (Blueprint $table) {
            $table->nullableMorphs('sectionable');
            $table->unique(['name', 'sectionable_id', 'sectionable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('directory_structures', function (Blueprint $table) {
            $table->dropMorphs('sectionable');
            $table->dropUnique(['name', 'sectionable_id', 'sectionable_type']);
        });
    }
};
