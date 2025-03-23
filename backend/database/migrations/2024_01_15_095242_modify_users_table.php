<?php

use App\Enums\UserType;
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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('supervisor1_user_id')->nullable();
            $table->unsignedBigInteger('supervisor2_user_id')->nullable();
            $table->boolean('is_supervisor')->default(false);
            $table->string('user_type')->default(UserType::GUEST());

            $table->foreign('supervisor1_user_id', 'fk_supervisor1')->references('id')->on('users')->onDelete("set null");
            $table->foreign('supervisor2_user_id', 'fk_supervisor2')->references('id')->on('users')->onDelete("set null");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign('fk_supervisor1');
            $table->dropForeign('fk_supervisor2');
            
            $table->dropColumn('supervisor1_user_id');
            $table->dropColumn('supervisor2_user_id');
            $table->dropColumn('is_supervisor');
            $table->dropColumn('user_type');
        });
    }
};
