<?php

return [
    'default' => env('EXPORT_STRATEGY', 'none'),

    'none' => [
        'class' => \App\Contracts\ExportStrategy::class,
    ],

    'hwe' => [
        'class' => \App\ExportStrategies\HweExportStrategy::class,
    ],

    'sap' => [
        'class' => \App\ExportStrategies\SapExportStrategy::class,
    ],

    'ict' => [
        'class' => \App\ExportStrategies\IctExportStrategy::class,
    ],

    'sct' => [
        'class' => \App\ExportStrategies\SctExportStrategy::class,
    ],

    'boh' => [
        'class' => \App\ExportStrategies\BohExportStrategy::class,
    ],

    'vop' => [
        'class' => \App\ExportStrategies\VopExportStrategy::class,
    ],

    'zi' => [
        'class' => \App\ExportStrategies\ZiExportStrategy::class,
    ],

    'adk' => [
        'class' => \App\ExportStrategies\ADKExportStrategy::class,
    ],

    'benacchio' => [
        'class' => \App\ExportStrategies\BenacchioExportStrategy::class,
    ],

    'agvs' => [
        'class' => \App\ExportStrategies\AGVSExportStrategy::class,
    ],
];
