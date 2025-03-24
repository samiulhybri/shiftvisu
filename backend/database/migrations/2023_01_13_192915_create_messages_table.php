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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId("chat_id")->constrained();
            $table->foreignId("sender_user_id")->nullable()->references("id")->on("users");
            $table->text("content");
            // A chat action (chat created, user added/removed)
            $table->string("chat_action")->nullable();
            // The user affected by a chat action (added/removed from a chat)
            $table->foreignId("affected_user_id")->nullable()->constrained("users");
            $table->boolean("read_by_all")->default(false);
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
        Schema::dropIfExists('messages');
    }
};
