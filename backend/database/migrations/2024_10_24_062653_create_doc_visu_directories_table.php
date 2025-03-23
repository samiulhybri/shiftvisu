<?php

use App\Models\DocVisu\DocVisuDirectory;
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
        Schema::create('doc_visu_directories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->morphs('parent');
            $table->unique(['name', 'parent_id', 'parent_type']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doc_visu_directories');
    }
};
