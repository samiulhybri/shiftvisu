<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\PackagingInstruction;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('packaging_instruction_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(PackagingInstruction::class)->nullable()->constrained()->nullOnDelete(); 
            $table->string('pos')->nullable();
            $table->morphs('packable');
            $table->boolean('is_container')->default(false);
            $table->double('target_quantity')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('packaging_instruction_pos');
    }
};
