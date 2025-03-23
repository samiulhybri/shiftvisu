<?php

namespace App\Providers;

use App\Events\ComponentScanned;
use App\Events\HandlingUnitCreated;
use App\Events\MachineCycleRegistered;
use App\Events\MachineShiftStarted;
use App\Events\MachineStateChanged;
use App\Events\MessageSent;
use App\Events\OperationClosed;
use App\Events\OperationProductionStarted;
use App\Events\OperationSetupStarted;
use App\Listeners\ChatGptMessageListener;
use App\Listeners\QualiVisuEventListener;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        MessageSent::class => [
            ChatGptMessageListener::class,
        ],
        ComponentScanned::class => [
            QualiVisuEventListener::class
        ],
        MachineCycleRegistered::class => [
            QualiVisuEventListener::class
        ],
        OperationSetupStarted::class => [
            QualiVisuEventListener::class
        ],
        OperationProductionStarted::class => [
            QualiVisuEventListener::class
        ],
        OperationClosed::class => [
            QualiVisuEventListener::class
        ],
        MachineStateChanged::class => [
            QualiVisuEventListener::class
        ],
        MachineShiftStarted::class => [
            QualiVisuEventListener::class
        ],
        HandlingUnitCreated::class => [
            QualiVisuEventListener::class
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     *
     * @return bool
     */
    public function shouldDiscoverEvents()
    {
        return false;
    }
}
