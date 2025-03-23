<?php

use App\Models\TestingScope;
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
        Schema::create('testing_scope_sample_depths', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(TestingScope::class)->constrained()->cascadeOnDelete();
            $table->string('sample_depth');
            $table->unique(['testing_scope_id', 'sample_depth']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testing_scope_sample_depths');
    }
};
