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
        Schema::create('testing_scope_melting_types', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\TestingScope::class)->constrained()->cascadeOnDelete();
            $table->string('melting_type');
            $table->index(['testing_scope_id','melting_type'], 'testing_scope_melting_types_id_unique');
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
        Schema::dropIfExists('testing_scope_melting_types');
    }
};
