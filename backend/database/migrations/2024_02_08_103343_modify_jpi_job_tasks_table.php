<?php

use App\Models\Model\JpiJob;
use App\Models\Model\JpiResourceCategory;
use App\Models\Model\JpiResourceGroup;
use App\Models\Model\JpiTask;
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
        Schema::table('jpi_job_tasks', function (Blueprint $table) {
            $table->foreignIdFor(JpiJob::class)->nullable()->constrained()->nullOnDelete();        
            $table->foreignIdFor(JpiTask::class)->nullable()->constrained()->nullOnDelete();
            $table->dropConstrainedForeignId('jpi_resource_category_id');
            $table->dropConstrainedForeignId('jpi_resource_group_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jpi_job_tasks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('jpi_job_id');
            $table->dropConstrainedForeignId('jpi_task_id');
            $table->foreignIdFor(JpiResourceCategory::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(JpiResourceGroup::class)->constrained()->cascadeOnDelete();
        });
    }
};
