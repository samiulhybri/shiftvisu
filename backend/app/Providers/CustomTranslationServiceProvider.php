<?php

namespace App\Providers;

use App\Helpers\CustomTranslator;
use Illuminate\Translation\FileLoader;
use Illuminate\Translation\TranslationServiceProvider;

class CustomTranslationServiceProvider extends TranslationServiceProvider
{
    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->registerLoader();

        $this->app->singleton('translator', function ($app) {
            $loader = $app['translation.loader'];

            // When registering the translator component, we'll need to set the default
            // locale as well as the fallback locale. So, we'll grab the application
            // configuration so we can easily get both of these values from there.
            $locale = $app->getLocale();

            $trans = new CustomTranslator($loader, $locale);

            $trans->setFallback($app->getFallbackLocale());

            return $trans;
        });
    }
}
