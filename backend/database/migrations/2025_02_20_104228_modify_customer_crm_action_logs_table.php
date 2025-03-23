<?php

use App\Models\Contact;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customer_crm_action_logs', function (Blueprint $table) {
            $table->foreignIdFor(Contact::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_crm_action_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Contact::class);
        });
    }
};
