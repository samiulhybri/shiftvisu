<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;
use Illuminate\Translation\Translator;

class CustomTranslator extends Translator
{
    /**
     * Get the translation for the given key.
     *
     * @param string $key
     * @param array $replace
     * @param string|null $locale
     * @param bool $fallback
     * @return string|array
     */
    public function get($key, array $replace = [], $locale = null, $fallback = true)
    {
        $locale = $locale ?: $this->locale;

        // For JSON translations, there is only one file per locale, so we will simply load
        // that file and then we will be ready to check the array for the key. These are
        // multiple levels deep (!)
        $this->load('*', '*', $locale);

        $line = $this->extractFromNestedJson($this->loaded['*']['*'][$locale], $key) ?? null;

        // If we can't find a translation for the JSON key, we will attempt to translate it
        // using the typical translation file. This way developers can always just use a
        // helper such as __ instead of having to pick between trans or __ with views.
        if (!isset($line)) {
            [$namespace, $group, $item] = $this->parseKey($key);

            // Here we will get the locale that should be used for the language line. If one
            // was not passed, we will use the default locales which was given to us when
            // the translator was instantiated. Then, we can load the lines and return.
            $locales = $fallback ? $this->localeArray($locale) : [$locale];

            foreach ($locales as $locale) {
                if (!is_null($line = $this->getLine(
                    $namespace,
                    $group,
                    $locale,
                    $item,
                    $replace
                ))) {
                    return $line;
                }
            }
        }

        // If the line doesn't exist, we will return back the key which was requested as
        // that will be quick to spot in the UI if language keys are wrong or missing
        // from the application's language files. Otherwise we can return the line.
        return $this->makeReplacements($line ?: $key, $replace);
    }

    private function extractFromNestedJson(array $data, string $key): ?string
    {
        $keys = explode('.', $key);

        // ignore leading messages key
        if ($keys[0] === "messages") {
            $keys = array_slice($keys, 1);
        }

        foreach ($keys as $innerKey) {
            if (!isset($data) || !is_array($data) || !array_key_exists($innerKey, $data)) {
                return null;
            }

            $data = $data[$innerKey];
        }

        if (!is_string($data)) {
            return null;
        }

        return $data;
    }
}
