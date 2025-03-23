<?php

use App\Models\StandardValueKey;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('standard_value_key_activity_types', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(StandardValueKey::class)->constrained();
            $table->boolean("is_active")->default(true);
            $table->string("pos");
            $table->timestamps();

            $table->unique(['standard_value_key_id', 'pos'], 'standard_value_key_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('standard_value_key_activity_types');
    }
};
