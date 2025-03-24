<?php

use App\Models\Hall;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tool_groups', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->foreignIdFor(Hall::class)->constrained();
            $table->timestamps();
        });

        $hall = Hall::query()->where("custom_id", "DZ-VERBINDUNGSTECHNIK")->first();

        if($hall) {
            DB::table('tool_groups')->insert([
                'custom_id' => 'WKZ',
                'name' => 'Werkzeuge',
                'hall_id' => $hall->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_groups');
    }
};
