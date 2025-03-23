<?php

use App\Enums\NotificationType;
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
        Schema::create('notification_group_notification_types', function (Blueprint $table) {
            $table->id();

            /**
             * if we don't specify the name
             * it will show error
             * Syntax error or access violation: 
             * 1059 Identifier name 'notification_group_notification_types_notification_group_id_foreign' is too long
             */
            $table->unsignedBigInteger('notification_group_id')->nullable();
            $table
                ->foreign('notification_group_id', 'notification_group_notification_types_fk')
                ->references('id')
                ->on('notification_groups')
                ->cascadeOnDelete();
                
            $table->string('notification_type')->default(NotificationType::ABSENCE_APPROVAL());
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
        Schema::dropIfExists('notification_group_notification_types');
    }
};
