<?php

namespace App\ExternalDataSource;

use App\ExternalDataSource\Dto\ItemDto;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use PDO;

putenv('ODBCSYSINI=/usr/local/etc');
putenv('ODBCINI=/usr/local/etc/odbc.ini');

class IHIExternalDataSource extends BaseVisuExternalDataSource
{
    //Connection to the AS400 DB
    private PDO $erp_db;

    public function __construct()
    {
        parent::__construct();
        $this->erp_db = new PDO("odbc:AS400", "SCHERTECH", "schere1");
    }

// TODO: For now items are imported from base_visu
    public function itemDtos($skip, $take): array|false
    {
        $query = "SELECT 
            SKIP {$skip}
            trim(t1.TETENR) as custom_id,
            trim(t1.TEBEZ1) AS name,
            trim(t1.TEWKSF) as material,
            (SELECT 1 FROM X300SD.LPLP t2 WHERE TRIM(t2.LPTENR) = trim(t1.TETENR) GROUP BY 1) as is_sales_item
            FROM X300SD.TEIL t1
            WHERE t1.TEFIRM = '1' AND t1.TEWKNR = '000' AND t1.TESTAP = '1' AND t1.TETART in ('1','9')
            ORDER BY trim(t1.TETENR)
            LIMIT {$take}";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $items = $stmt->fetchAll();

        $records = [];
        foreach ($items as $item) {
            $records[] = new ItemDto(
                name: $item['NAME'],
                custom_id: $item['CUSTOM_ID'],
                is_sales_item: $item['IS_SALES_ITEM'],
            );

        }
        return $records;
    }

//AS400 does not support Hall concept
//Therefore halls are imported from base_visu
// TODO: Can be deleted once base_visu is handled with laravel

//    /**
//     * @return Collection
//     * $records->push([
//     *      'custom_id' => 'HAL1',
//     *      'name' => 'Giesserei',
//     * ]);
//     */
//    public function halls(): Collection
//    {
//        return collect([]);
//    }

//AS400 does not support machinegroup concept
//Therefore halls are imported from base_visu
// TODO: Can be deleted once base_visu is handled with laravel

//    /**
//     * @return Collection
//     * $records->push([
//     *      'custom_id' => 'G100',
//     *      'name' => '100T Maschinen',
//     * ]);
//     */
//    public function halls(): Collection
//    {
//        return collect([]);
//    }

    /**
     * @return Collection
     * $records->push([
     *      'custom_pos' => '10',
     *      'custom_operation_plan_id' => 'I2000',
     *      'custom_machine_id' => 'M1000',
     *      'name' => 'Giessen',
     * ]);
     */
    public function operations(): Collection
    {
        $query = "SELECT trim(AR.AGAGNR) AS custom_pos,
                trim(AR.AGTENR) AS custom_operation_plan_id,
                trim(AR.AGMAZT * 60) AS te,
                trim(AR.AGRUZT * T.TELOGR * 60) AS tr,
                trim(AR.AGMANR) AS custom_machine_id,
                trim(AR.AGAGBZ) AS name
            FROM X300SD.ARAG as AR
            JOIN X300SD.TEIL as T on AR.AGFIRM = T.TEFIRM AND AR.AGWKNR = T.TEWKNR AND AR.AGTENR = T.TETENR
            WHERE AR.AGFIRM = '1' AND AR.AGWKNR = '000' and AR.AGAGAL = ''";
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $operations = $stmt->fetchAll();

        $records = collect();
        foreach ($operations as $operation) {
            $records->push([
                'custom_pos' => $operation['CUSTOM_POS'],
                'custom_operation_plan_id' => $operation['CUSTOM_OPERATION_PLAN_ID'],
                'custom_machine_id' => $operation['CUSTOM_MACHINE_ID'],
                'te' => $operation['TE'],
                'tr' => $operation['TR'],
                'name' => utf8_encode($operation['NAME']),
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function prodOrders(?string $onlyCustomId): Collection
    {
        $query = "SELECT trim(WAAUNR) AS custom_id,
            10 as custom_pos,
            trim(WATENR) as custom_item_id,
            trim(WASTTE) as start,
            trim(WAENTE) as end,
            trim(WAFEMG) as quantity,
            trim(OAAGNR) as custom_op_plan_pos,
            trim(OAAGBZ) as op_plan_pos_name,
            trim(OAMAZT * 60) as op_plan_pos_te,
            trim(OARUZT * TELOGR * 60) as op_plan_pos_tr,
            trim(OAMANR) as op_plan_pos_custom_machine_id,
            trim(OARMMG) as op_plan_pos_registered_quantity,
            WASTAT as state,
            FROM X300SD.WAKO
            JOIN X300SD.OFAG ON WAFIRM = OAFIRM AND WAWKNR = OAWKNR AND WAAUNR = OAAUNR
            JOIN X300SD.TEIL ON WAFIRM = TEFIRM AND WAWKNR = TEWKNR AND WATENR = TETENR
            WHERE WAFIRM = '1' AND WAWKNR = '000' AND (WASTAT = '10' OR WASTAT = '30' OR WASTAT = '50') AND WASTTE > '2023'
            ORDER BY WAAUNR, OAAGNR";

        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $prod_orders = $stmt->fetchAll();

        $records = collect();
        foreach ($prod_orders as $prod_order) {
            $records->push([
                'custom_id' => $prod_order['CUSTOM_ID'],
                'custom_pos' => $prod_order['CUSTOM_POS'],
                'pos_state' => $prod_order['STATE'] == '50' ? "CLOSED" : ($prod_order['STATE'] == '30' ? "IN_PRODUCTION" : "PLANNED"),
                'custom_item_id' => $prod_order['CUSTOM_ITEM_ID'],
                'start' => $prod_order['START'],
                'end' => $prod_order['END'],
                'quantity' => $prod_order['QUANTITY'],
                'custom_op_plan_pos' => $prod_order['CUSTOM_OP_PLAN_POS'],
                'op_plan_pos_name' => $prod_order['OP_PLAN_POS_NAME'] ?? '',
                'op_plan_pos_te' => $prod_order['OP_PLAN_POS_TE'],
                'op_plan_pos_tr' => $prod_order['OP_PLAN_POS_TR'],
                'op_plan_pos_custom_machine_id' => $prod_order['OP_PLAN_POS_CUSTOM_MACHINE_ID'],
                'op_plan_pos_registered_quantity' => $prod_order['OP_PLAN_POS_REGISTERED_QUANTITY'],
            ]);
        }

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    /**
     * @return Collection
     * $records->push([
     *      'custom_id' => 'S100',
     *      'custom_item_id' => 'I2000',
     *      'custom_pos' => '10',
     *      'qty_for_one_parent' => 1,
     * ]);
     */
    public function boms(): Collection
    {
        $query = "SELECT trim(STBGNR) AS custom_id,
                trim(STPONR) AS custom_pos,
                trim(STKOMP) AS custom_item_id,
                trim(STVANR) AS variant,
                STEIGW AS qty_for_one_parent
            FROM X300SD.STRU
            WHERE STFIRM = '1' AND STWKNR = '000'";
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $boms = $stmt->fetchAll();

        $records = collect();
        foreach ($boms as $bom) {
            $pos = $bom['VARIANT'] == '' ? $bom['CUSTOM_POS'] : ($bom['CUSTOM_POS'] . '-' . $bom['VARIANT']);
            $records->push([
                'custom_id' => $bom['CUSTOM_ID'],
                'custom_pos' => $pos,
                'custom_item_id' => $bom['CUSTOM_ITEM_ID'],
                'qty_for_one_parent' => $bom['QTY_FOR_ONE_PARENT'],
                'is_active' => $bom['VARIANT'] == '',
                'lead_time_days' => 0,
            ]);
        }

        return $records;
    }

    public function tools(): Collection
    {
        $records = collect([]);
        $records->push([
            'custom_id' => 'WKZ1',
            'name' => 'Werkzeug 1',
        ]);

        $records->push([
            'custom_id' => 'WKZ2',
            'name' => 'Werkzeug 2',
        ]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    /**
     * @return Collection
     * $records->push([
     *      'custom_id' => 'L1',
     *      'name' => 'Lagerplatz 1',
     * ]);
     */
    public function warehouses(): Collection
    {
        $query = "SELECT trim(LCLANR) AS custom_id,
                trim(LCNAM1) AS name
            FROM X300SD.LAGR
            WHERE LCFIRM = '1' AND LCWKNR = '000' ";
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $warehouses = $stmt->fetchAll();

        $records = collect();
        foreach ($warehouses as $warehouse) {
            $records->push([
                'custom_id' => $warehouse['CUSTOM_ID'],
                'name' => utf8_encode($warehouse['NAME']),
            ]);
        }

        return $records;
    }

    /**
     * @return Collection
     * $records->push([
     *      'custom_item_id' => 'I2000',
     *      'custom_warehouse_id' => 'L1',
     *      'quantity' => 100,
     * ]);
     */
    public function stocks(): Collection
    {
        $query = "SELECT trim(LSTENR) AS custom_item_id,
                trim(LSLANR) AS custom_warehouse_id,
                trim(LSLGBE) AS quantity
            FROM X300SD.LGBS
            WHERE LSFIRM = '1' AND LSWKNR = '000' AND trim(LSLANR) <> '07'";
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $stocks = $stmt->fetchAll();

        $records = collect();
        foreach ($stocks as $stock) {
            $records->push([
                'custom_item_id' => $stock['CUSTOM_ITEM_ID'],
                'custom_warehouse_id' => $stock['CUSTOM_WAREHOUSE_ID'],
                'quantity' => $stock['QUANTITY'],
            ]);
        }

        return $records;
    }

    /**
     * @return Collection
     *
     *  $records->push([
     *      'custom_id' => 'ABR1',
     *      'custom_item_id' => 'I1000',
     *      'date' => today()->addWeeks(1),
     *      'quantity' => 100,
     *  ]);
     */
    public function callOffs(): Collection
    {
        $query = "SELECT trim(LTTENR) AS custom_item_id,
                LTBDTE AS date,
                (LTBDMG - LTGLMG) AS quantity
            FROM X300SD.LPMT
            JOIN X300SD.TEIL on TEFIRM = LTFIRM AND TEWKNR = LTWKNR and TETENR = LTTENR
            WHERE LTFIRM = '1' AND LTWKNR = '000' AND LTHIFL <> 'X' AND (LTSART = '40' OR LTSART = '50') AND (LTBDMG - LTGLMG) > 0 and LTBDTE > '20220101' AND TESTAP = '1'";
        $stmt = $this->erp_db->prepare($query);
        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
        $stmt->execute();
        $call_offs = $stmt->fetchAll();
        $records = collect();
        foreach ($call_offs as $call_off) {
            $records->push([
                'custom_item_id' => $call_off['CUSTOM_ITEM_ID'],
                'date' => Carbon::createFromFormat('Ymd', "{$call_off['DATE']}"),
                'quantity' => $call_off['QUANTITY'],
            ]);
        }

        return $records;
    }
}
