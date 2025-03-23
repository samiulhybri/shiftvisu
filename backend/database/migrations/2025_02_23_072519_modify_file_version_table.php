<?php

use App\Enums\FileVersionType;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
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
        Schema::table('file_versions', function (Blueprint $table) {
            $table->string('type')->default(FileVersionType::CREATED());
            $table->foreignIdFor(Media::class, 'media_file_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('updated_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('file_versions', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->dropForeign(['media_file_id']);
            $table->dropColumn('media_file_id');
            $table->dropColumn('updated_name');
        });
    }
};
