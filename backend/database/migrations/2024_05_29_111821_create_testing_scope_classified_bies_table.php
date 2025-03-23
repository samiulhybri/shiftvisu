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
        Schema::create('testing_scope_classified_bies', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\TestingScope::class)->constrained()->cascadeOnDelete();
            $table->string('classified_by');
            $table->index(['testing_scope_id','classified_by'], 'testing_scope_classified_bies_id_unique');
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
        Schema::dropIfExists('testing_scope_classified_bies');
    }
};
