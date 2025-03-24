<?php

namespace App\Providers;

use App\Models\User;
use App\Services\ImportFromBTPService;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $default = config('external_data_source.default');
        $external_data_source = config("external_data_source.{$default}.class");
        $this->app->singleton(\App\Contracts\ExternalDataSource::class, $external_data_source);

        $default = config('export_strategy.default');
        $exportStrategy = config("export_strategy.{$default}.class");
        $this->app->singleton(\App\Contracts\ExportStrategy::class, $exportStrategy);

        $default = config('jpi_import.default');
        $jpiImportStrategy = config("jpi_import.{$default}.class");
        $this->app->singleton(\App\Contracts\JpiImportStrategy::class, $jpiImportStrategy);

        if ($this->app->environment('local')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }

        Auth::viaRequest('custom-token', function (Request $request) {
            $jwt = $request->bearerToken();
            if ($jwt) {
                try {
                    $decoded = JWT::decode($jwt, new Key(env("XSUAA_PUB_KEY"), 'RS256'));
                    if (in_array("uaa.resource", $decoded->scope)) {
                        return new User();
                    }
                } catch (\Exception $e) {
                }
            }

            // Attempt to authenticate the user using the normal guard.
            if (env("V10_ENABLED")) {
                // Disable this check for legacy systems.
                return new User();
            } else {
                return Auth::guard('api')->user();
            }
        });

        $this->app->singleton(ImportFromBTPService::class, function ($app) {
            return new ImportFromBTPService();
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
    }
}
