<?php

use App\Models\DocVisu\DocVisuFile;
use App\Models\User;
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
        Schema::create('file_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('version')->default(0); // 0 -> created
            $table->foreignIdFor(DocVisuFile::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'user_id_creator')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_versions');
    }
};
