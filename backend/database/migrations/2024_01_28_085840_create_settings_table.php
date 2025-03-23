<?php

use App\Enums\EncryptionType;
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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('email_username')->nullable();
            $table->string('email_address')->nullable();
            $table->string('email_password')->nullable();
            $table->integer('email_port')->default(80);
            $table->string('email_host')->nullable();
            $table->string('email_encryption')->default(EncryptionType::SSL());
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
        Schema::dropIfExists('settings');
    }
};
