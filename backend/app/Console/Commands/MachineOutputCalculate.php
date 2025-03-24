<?php

namespace App\Console\Commands;

use App\Services\CapacityPlanService;
use App\Services\MachineDailyForecastService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MachineOutputCalculate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'machine-output:calculate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    private MachineDailyForecastService $forecastService;
    private CapacityPlanService $capacityPlanService;

    // TODO:: Will uncomment when use Service Class
    public function __construct(MachineDailyForecastService $forecastService, CapacityPlanService $capacityPlanService)
    {
        parent::__construct();
        $this->forecastService = $forecastService;
        $this->capacityPlanService = $capacityPlanService;
    }

    public function handle()
    {

        try {

            $this->forecastService->truncateOldData();

            $machines = $this->forecastService->getActiveMachines();

            foreach ($machines as $machine) {
                $odersDetails = $this->forecastService->getMachineOrders($machine);
                $this->calculateProductionPlan($machine, $odersDetails);
            }
            Log::info("machine-output:calculate command ran successfully!");
        } catch (\Throwable $th) {
            Log::error($th);
        }
    }

    public function calculateProductionPlan($machine, $ordersDetails)
    {

        foreach ($ordersDetails as $order) {


            $calculatedEndTime = $this->capacityPlanService->calculateEndTime($order['start'], $order['required_time'], $machine->id);

            $startShiftTime = $calculatedEndTime['start'];
            $endShiftTime = $calculatedEndTime['end'];

            $requiredTimeToProduceSingleQuantity = ($order['te'] / $order['cavity']);

            $capacities = $this->capacityPlanService->getMachineCapacity($machine, $startShiftTime, $endShiftTime);

            $totalQuantityToProduce = $order['quantity'];

            $predictedQuantityDetails = $this->capacityPlanService->calculateShiftAvailabilityToProduceQuantity($capacities, $requiredTimeToProduceSingleQuantity, $order, $startShiftTime, $endShiftTime, $totalQuantityToProduce);

            if (sizeof($predictedQuantityDetails) > 0) {
                $this->forecastService->insertForecastData($predictedQuantityDetails, $order);
            }
        }
    }
}
