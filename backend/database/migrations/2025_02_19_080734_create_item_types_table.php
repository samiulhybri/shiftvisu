<?php

use App\Models\ItemGroup;
use App\Models\ItemType;
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
        Schema::create('item_types', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_active')->default(true);
            $table->string('custom_id')->unique();
            $table->string('name')->nullable();
            $table->boolean('is_stocked_in_hu')->default(false);
            $table->boolean('is_packaging')->default(false);
            $table->timestamps();
        });

        ItemGroup::all()->each(function ($itemGroup) {
            ItemType::query()->insert([
                'id' => $itemGroup->id,
                'custom_id' => $itemGroup->custom_id,
                'name' => $itemGroup->name,
                'is_stocked_in_hu' => $itemGroup->is_stocked_in_hu,
                'is_packaging' => $itemGroup->is_packaging,
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_types');
    }
};
