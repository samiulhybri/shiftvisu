<?php /** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource\TimeLine;

use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class ZIExternalDataSource extends TimeLineExternalDataSource
{
    public function __construct()
    {
        parent::__construct();
        $this->erp_db = new PDO("odbc:ZIERP", "schertech", "St76887!");
    }

    /**
     * @return string
     */
    public function getUsersQuery(): string
    {
        return "SELECT trim(mitarb.kuerzel) as custom_id, 
                trim(mitarb.name + ' ' + mitarb.zeile1) as name, 
                (IF mitarb.ausgeschieden IS NULL THEN 1 ELSE 0 ENDIF ) as is_active,
                trim(mitarb.karten_nr) as chip_number,
                trim(mitarb.email) as email,
                trim(mitarb.kuerzel) as username 
            FROM mitarb";
    }
}
