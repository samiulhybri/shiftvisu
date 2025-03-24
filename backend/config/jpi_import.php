<?php

return [
    'default' => env('JPI_IMPORT_STRATEGY', 'ict'),

    'sct' => [
        'class' => App\JpiImports\SctJpiImport::class,
    ],

    'ict' => [
        'class' => App\JpiImports\IctJpiImport::class,
    ],
];