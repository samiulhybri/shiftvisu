<?php

use App\Models\Metallography;
use App\Models\TestingScope;
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
        TestingScope::whereNull('regulation')->update(['regulation' => '']);
        TestingScope::whereNull('issue_revision')->update(['issue_revision' => '']);
        TestingScope::whereNull('attestation')->update(['attestation' => '']);
        TestingScope::whereNull('frequency')->update(['frequency' => '']);

        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->string('regulation')->nullable(false)->change();
            $table->string('issue_revision')->nullable(false)->change();
            $table->string('attestation')->nullable(false)->change();
            $table->string('frequency')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->string('regulation')->nullable()->change();
            $table->string('issue_revision')->nullable()->change();
            $table->string('attestation')->nullable()->change();
            $table->string('frequency')->nullable()->change();
        });
    }
};
