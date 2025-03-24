<?php

use App\Models\Chat;
use App\Models\EmployeeClassification;
use App\Models\MachineClassification;
use App\Models\MarketSegment;
use App\Models\PotentialClassification;
use App\Models\RevenueClassification;
use App\Models\SalesStatus;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('website')->nullable();
            $table->date('date_follow_up')->nullable();
            $table->foreignIdFor(RevenueClassification::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(MachineClassification::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(EmployeeClassification::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(PotentialClassification::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(SalesStatus::class)->nullable()->constrained();
            $table->foreignIdFor(Chat::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(User::class, 'user_id_responsible')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(MarketSegment::class)->nullable()->constrained()->nullOnDelete();
            $table->string('external_id')->nullable();
            $table->string('source')->nullable();
            $table->date('date_sourced')->nullable();
            $table->text(column: 'note')->nullable();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['website', 'date_follow_up', 'external_id', 'source', 'date_sourced', 'note']);
            $table->dropConstrainedForeignIdFor(SalesStatus::class);
            $table->dropConstrainedForeignIdFor(User::class, 'user_id_responsible');
            $table->dropConstrainedForeignIdFor(MarketSegment::class);
            $table->dropConstrainedForeignIdFor(RevenueClassification::class);
            $table->dropConstrainedForeignIdFor(MachineClassification::class);
            $table->dropConstrainedForeignIdFor(EmployeeClassification::class);
            $table->dropConstrainedForeignIdFor(PotentialClassification::class);
            $table->dropConstrainedForeignIdFor(Chat::class);
        });
    }
};
