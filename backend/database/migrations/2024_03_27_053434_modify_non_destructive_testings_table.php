<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('non_destructive_testings', function (Blueprint $table) {
            $table->dropColumn(['ultrasound_standard',
                'surface_crack_standard',
                'surface_crack_test_duration',
                'ultrasound_test_duration']);
            $table->foreignIdFor(\App\Models\UsNorm::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('non_destructive_testings', function (Blueprint $table) {
            $table->double('ultrasound_test_duration')->nullable();
            $table->double('surface_crack_test_duration')->nullable();
            $table->string('surface_crack_standard')->nullable();
            $table->string('ultrasound_standard')->nullable();
            $table->dropConstrainedForeignId('us_norm_id');
        });
    }
};
