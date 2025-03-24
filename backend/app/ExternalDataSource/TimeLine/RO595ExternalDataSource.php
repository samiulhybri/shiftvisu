<?php /** @noinspection SqlNoDataSourceInspection */

namespace App\ExternalDataSource\TimeLine;

use Illuminate\Support\Collection;
use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class RO595ExternalDataSource extends TimeLineExternalDataSource
{
    public function __construct()
    {
        parent::__construct();
        $this->erp_db = new PDO("odbc:595ERP", "Abram", "Schertech2#2022");
    }

//    AHO
//    Removed email address as we had issues with duplicates
    public function users(): Collection
    {
        $query = "SELECT trim(mitarb.kuerzel) as custom_id, 
                trim(mitarb.name + ' ' + mitarb.zeile1) as name, 
                (IF mitarb.ausgeschieden IS NULL THEN 1 ELSE 0 ENDIF ) as is_active,
                trim(mitarb.karten_nr) as chip_number,
                trim(users.name) as username 
            FROM mitarb 
            LEFT OUTER JOIN users ON users.id = mitarb.user_id
                WHERE LENGTH(trim(mitarb.name)) > 0";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $results = $stmt->fetchAll();

        $records = collect();
        foreach ($results as $result) {
            $records->push([
                'custom_id' => $result['custom_id'],
                'name' => $result['name'],
                'is_active' => $result['is_active'],
                'chip_number' => $result['chip_number'],
                'username' => $result['username'],
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }
}
