<?php

use App\Enums\TransportOrderPosStatus;
use App\Models\Item;
use App\Models\ProdOrderPosBomPos;
use App\Models\TransportOrder;
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
        Schema::create('transport_order_pos', function (Blueprint $table) {
            $table->id();
            $table->string('pos');
            $table->foreignIdFor(ProdOrderPosBomPos::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(TransportOrder::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Item::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignId('responsible_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default(TransportOrderPosStatus::NOT_ACCEPTED());
            $table->boolean('is_accepted')->default(false);
            $table->boolean('is_urgent')->default(false);
            $table->dateTime('entry_date');
            $table->unique(['transport_order_id', 'pos']);
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
        Schema::dropIfExists('transport_order_pos');
    }
};

