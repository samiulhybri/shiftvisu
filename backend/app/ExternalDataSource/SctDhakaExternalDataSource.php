<?php

/** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource;

class SctDhakaExternalDataSource extends BaseVisuExternalDataSource
{
    public function __construct()
    {
        // basevisu db credential
        define('BASEVISU_DB_HOST', '192.168.1.231');
        define('BASEVISU_DB_PORT', '3306');
        define('BASEVISU_DB_USERNAME', 'root');
        define('BASEVISU_DB_PASSWORD', 'plc-db');
        
        parent::__construct(BASEVISU_DB_HOST, BASEVISU_DB_PORT, BASEVISU_DB_USERNAME, BASEVISU_DB_PASSWORD);
    }
}