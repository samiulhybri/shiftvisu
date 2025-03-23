<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('machine_resource_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Machine::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\ResourceGroup::class)->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['machine_id', 'resource_group_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('machine_resource_groups');
    }
};
