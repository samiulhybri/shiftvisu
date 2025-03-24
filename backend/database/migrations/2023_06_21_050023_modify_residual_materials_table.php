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
        Schema::table('residual_materials', function (Blueprint $table) {
            $table->renameColumn('issue_revision_status', 'revision');
            $table->renameColumn('stamping_samples', 'marking');
            $table->string('frequency')->nullable();
            $table->dropColumn('per_component');
        });
    }
    
    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('residual_materials', function (Blueprint $table) {
            $table->renameColumn('revision', 'issue_revision_status');
            $table->renameColumn('marking', 'stamping_samples');
            $table->dropColumn('frequency');
            $table->boolean('per_component')->default(false);
        });
    }
};
