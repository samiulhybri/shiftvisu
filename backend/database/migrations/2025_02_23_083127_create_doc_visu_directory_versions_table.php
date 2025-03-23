<?php

use App\Enums\DocVisuDirectoryVersionType;
use App\Models\DocVisu\DocVisuDirectory;
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
        Schema::create('doc_visu_directory_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('version')->default(0); // 0 -> created
            $table->foreignIdFor(DocVisuDirectory::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'user_id_creator')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type')->default(DocVisuDirectoryVersionType::CREATED());
            $table->string('updated_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doc_visu_directory_versions');
    }
};
