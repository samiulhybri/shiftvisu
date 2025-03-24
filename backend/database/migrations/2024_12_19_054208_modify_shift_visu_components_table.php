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
        Schema::table('shift_visu_components', function (Blueprint $table) {
            $table->string('custom_id')->nullable();
        });

        
        Schema::table('shift_visu_components', function (Blueprint $table) {
            $counter = 1;
            $components = DB::table('shift_visu_components')->whereNull('custom_id')->get();

            foreach ($components as $component) {
                // Generate the unique code in the format 'SVC-XXXX'
                $uniqueCode = 'SVC-' . str_pad($counter, 4, '0', STR_PAD_LEFT); // Pad with zeros to make custom_id length to 8
                DB::table('shift_visu_components')->where('id', $component->id)->update(['custom_id' => $uniqueCode]);
    
                $counter++; // Increment the counter for the next component
            }
        });
        
        Schema::table('shift_visu_components', function (Blueprint $table) {
            $table->string('custom_id')->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shift_visu_components', function (Blueprint $table) {
            $table->dropColumn(['custom_id']);
        });
    }
};
