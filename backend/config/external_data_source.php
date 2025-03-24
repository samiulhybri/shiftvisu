<?php

use App\ExternalDataSource\TimeLine\BOHExternalDataSource;
use App\ExternalDataSource\TimeLine\RO595ExternalDataSource;
use App\ExternalDataSource\TimeLine\ZIExternalDataSource;
use App\ExternalDataSource\TimeLine\AGVSExternalDataSource;

return [
    'default' => env('EXTERNAL_DS_TARGET'),

    'ihi' => [
        'class' => App\ExternalDataSource\IHIExternalDataSource::class,
    ],

    'adk' => [
        'class' => App\ExternalDataSource\ADKExternalDataSource::class,
    ],

    'adk_v2' => [
        'class' => App\ExternalDataSource\ADKNewExternalDataSource::class,
    ],

    'base_visu' => [
        'class' => App\ExternalDataSource\BaseVisuExternalDataSource::class,
    ],

    'sap' => [
        'class' => App\ExternalDataSource\SapDataSource::class,
    ],

    'sap_api' => [
        'class' => App\ExternalDataSource\SapApiExternalDataSource::class,
    ],

    'benacchio' => [
        'class' => App\ExternalDataSource\BenacchioExternalDataSource::class,
    ],

    'zi' => [
        'class' => ZIExternalDataSource::class,
    ],

    'ro595' => [
        'class' => RO595ExternalDataSource::class,
    ],
    'boh' => [
        'class' => BOHExternalDataSource::class,
    ],
    'agvs' => [
        'class' => AGVSExternalDataSource::class,
    ],
    'ict' => [
        'class' => App\ExternalDataSource\ICTExternalDataSource::class,
    ],
    'ict_test' => [
        'class' => App\ExternalDataSource\IctTestExternalDataSource::class,
    ],
    'vop' => [
        'class' => App\ExternalDataSource\VOPExternalDataSource::class,
    ],
    'skt' => [
        'class' => App\ExternalDataSource\SKTExternalDataSource::class,
    ],
    'sct' => [
        'class' => App\ExternalDataSource\SctExternalDatasource::class,
    ],
    'sct_dhaka' => [
        'class' => App\ExternalDataSource\SctDhakaExternalDataSource::class,
    ],
    'at' => [
        'class' => App\ExternalDataSource\AutotestExternalDataSource::class,
    ],
    'die' => [
        'class' => App\ExternalDataSource\DieExternalDataSource::class,
    ],
    'test' => [
        'class' => App\ExternalDataSource\TestExternalDataSource::class,
    ],
];
