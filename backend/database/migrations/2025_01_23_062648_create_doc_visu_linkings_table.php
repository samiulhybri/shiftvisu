<?php

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
        Schema::create('doc_visu_linkings', function (Blueprint $table) {
            $table->id();
            $table->morphs('parent'); // Refer to DirectoryStructure, DocVisuDirectory
            $table->morphs('linkable'); // Refer to DirectoryStructure, DocVisuDirectory, DocVisuFile
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doc_visu_linkings');
    }
};
