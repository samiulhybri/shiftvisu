<?php

use App\Models\Metallography;
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
        Metallography::whereNull('regulation')->update(['regulation' => '']);
        Metallography::whereNull('issue_revision')->update(['issue_revision' => '']);

        Schema::table('metallographies', function (Blueprint $table) {
            $table->string('regulation')->nullable(false)->change();
            $table->string('issue_revision')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('metallographies', function (Blueprint $table) {
            $table->string('regulation')->nullable()->change();
            $table->string('issue_revision')->nullable()->change();
        });
    }
};
