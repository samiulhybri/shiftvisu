<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('operation_control_profiles', function (Blueprint $table) {
            $table->id();
            $table->string("custom_id")->unique();
            $table->boolean("is_active")->default(true);
            $table->boolean("post_goods_receipt_automatically")->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operation_control_profiles');
    }
};
