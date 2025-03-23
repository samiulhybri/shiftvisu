<?php

use App\Enums\DateToConsider;
use App\Enums\EncryptionType;
use App\Enums\ShiftDate;
use App\Enums\StatusBoardSidebarType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('date_to_consider')->default(DateToConsider::SHIFT_START())->change();
        });

        // Insert a new row into the table if there are no existing rows
        if (DB::table('settings')->count() == 0) {
            DB::table('settings')->insert([
                'email_encryption' => EncryptionType::SSL(),
                'status_board_sidebar_type' => StatusBoardSidebarType::STANDARD_1(),
                'date_to_consider' => DateToConsider::SHIFT_START(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('date_to_consider')->default(ShiftDate::PREVIOUSDAY())->change();
        });
    }
};
