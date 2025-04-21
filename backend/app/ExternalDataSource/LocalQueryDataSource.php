<?php

namespace App\ExternalDataSource;

use App\Enums\ItemStateType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\SectionActivatableTypes;
use App\Enums\ProdOrderType;
use App\Models\MachineState;
use App\Models\Customer;
use App\Models\Department;
use App\Models\Hall;
use App\Models\Item;
use App\Models\ItemState;
use App\Models\Machine;
use App\Models\MachineGroup;
use App\Models\ProdOrder;
use App\Models\SectionActivatable;
use App\Models\Shift;
use App\Models\ShiftModel;
use App\Models\Supplier;
use App\Models\Tool;
use App\Models\TpmGroup;
use App\Models\TpmSubGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LocalQueryDataSource
{
    /**
     * Prepare data to build query for base_visu tables
     *
     * @return array
     */
    public static function teile()
    {
        $allQueryForItems = [];
        Item::whereNull('is_tool')->chunk(env('DATA_CHUNK_SIZE'), function (Collection $items) use (&$allQueryForItems) {
            $colums = [];
            foreach ($items as $item) {
                $field = [
                    "teilenr" => $item['custom_id'],
                    "teilebez_1" => $item['name'],
                    "teilebez_2" => '',
                    "teilebez_3" => '',
                    "baugruppe" => '',
                    "aktiv_inaktiv" => isset($item['is_active']) ? $item['is_active'] : 0,
                    "konzern" => '',
                    "artikelgruppe" => '',
                    "teileart" => 0,
                    "material" => '',
                    "anwendung" => 0,
                    "verkauf_teil" => isset($item['verkauf_teil']) ? $item['verkauf_teil'] : 0,
                    "maschine" => '',
                    "werkzeugnr" => '',
                    "fertigungstiefe" => 0,
                    "regal" => '',
                    "ebene" => '',
                    "fach" => '',
                    "is_erp" => 1
                ];
                $colums[] = $field;
            }

            $identifiers = ['teilenr'];
            $toUpdate = ['teilebez_1'];
            $queryInfo = [
                "columns" => $colums, // which should be inserted
                "identifiers" => $identifiers, // based on this identifiers we will update if match found
                "to_update" => $toUpdate // this fields will be updated
            ];
            $allQueryForItems[] = $queryInfo;
        });
        return $allQueryForItems;
    }

    /**
     * Provides an array that is needed for media import in base_visu.t_attachments Function only prepared for items media
     *
     * @return array
     */
    public static function media()
    {
        $resultmedia = [];
        $mediaItems = DB::table('media as med')
            ->join('items as itm', function ($join) {
                $join->on('med.model_id', 'itm.id')
                    ->where('med.model_type', 'App\\Models\\Item');
            })
            ->join('base_visu.sd_teile as baseItm', 'itm.custom_id', 'baseItm.teilenr')
            ->select('baseItm.id as parent_id', 'med.file_name', 'med.size', 'med.id as media_id')
            ->orderBy('med.id')
            ->chunk(env('DATA_CHUNK_SIZE'), function ($mediaFiles) use (&$resultmedia) {
                foreach ($mediaFiles as $file) {
                    $filepath = '../../storage/' . $file->media_id . '/' . $file->file_name;
                    $field = [
                        "parent_id" => $file->parent_id,
                        "type" => 1,
                        "name" => $filepath,
                        "original_name" => $file->file_name,
                        "ext" => '.jpg',
                        "size" => $file->size,
                        "description" => '',
                        "is_standard" => 1,
                        "media_id" => $file->media_id,
                    ];
                    $colums[] = $field;
                }
                $identifiers = ['media_id'];
                $toUpdate = ['original_name', 'name', 'size'];
                $queryInfo = [
                    "columns" => $colums, // which should be inserted
                    "identifiers" => $identifiers, // based on this identifiers we will update if match found
                    "to_update" => $toUpdate // this fields will be updated
                ];
                $resultmedia[] = $queryInfo;
            });
        return $resultmedia;
    }

    /**
     * Prepare data to build query for base_visu tables
     *
     * @return array
     */
    public static function hall()
    {
        $allQueryForHalls = [];
        Hall::chunk(env('DATA_CHUNK_SIZE'), function (Collection $halls) use (&$allQueryForHalls) {
            $colums = [];
            $toUpdate = ['hallebez', 'aktiv_inaktiv'];
            foreach ($halls as $hall) {
                if (env('EXTERNAL_DS_TARGET') == 'at') {
                    $oldInfo = DB::connection('old_base_visu')
                        ->table('sd_halle')
                        ->where('hallenr', $hall['custom_id'])
                        ->first(['shiftvisu', 'tpmvisu']);
                    $toUpdate = ['hallebez', 'aktiv_inaktiv', 'tpmvisu', 'shiftvisu'];
                }

                $field = [
                    "hallenr"         => $hall['custom_id'],
                    "hallebez"      => $hall['name'],
                    "aktiv_inaktiv"   => $hall['is_active'] ?? false,
                    "is_erp"          => 1,
                    "castvisu"        => 0,
                    "prodvisu"        => 0,
                    "capacity"        => 0,
                    "planvisu"        => 0,
                    "shiftvisu"       => $oldInfo->shiftvisu ?? 0,
                    "tpmvisu"         => $oldInfo->tpmvisu ?? 0,
                    "processvisu"     => 0,
                    "leanvisu"        => 0,
                    "mesvisu"         => 0,
                    "oee"             => 0.0,
                    "nutzung"         => 0.0,
                    "produkt"         => 0.0,
                    "ausschuss"       => 0.0,
                    "qualivisu"       => 0
                ];
                $colums[] = $field;
            }

            $identifiers = ['hallenr'];
            $queryInfo = [
                "columns" => $colums, // which should be inserted
                "identifiers" => $identifiers, // based on this identifiers we will update if match found
                "to_update" => $toUpdate // this fields will be updated
            ];
            $allQueryForHalls[] = $queryInfo;
        });
        return $allQueryForHalls;
    }

    public static function customersAndSuppliers($type)
    {
        $allQueryForCustomerAndSupplier = [];
        $model = $type == 1 ? Customer::class : Supplier::class;
        $model::chunk(env('DATA_CHUNK_SIZE'), function (Collection $allData) use (&$allQueryForCustomerAndSupplier, $type) {
            $columns = [];
            foreach ($allData as $data) {
                $field = [
                    "kundeliefnr"       => $data['custom_id'],
                    "kundeliefbez1"     => $data['name'],
                    "kundeliefbez2"     => '',
                    "aktiv_inaktiv"     => $data['is_active'],
                    "kunde_lief"        => $type,
                    "adresse"           => '',
                    "plz"               => '',
                    "stadt"             => '',
                    "provinz"           => '',
                    "land"              => '',
                    "telefon"           => isset($data['telephone']) ? $data['telephone'] : '',
                    "email"             => isset($data['email']) ? $data['email'] : '',
                    "kunde_lief_gruppe" => '',
                    "ansprechpartner" => '',
                    "is_erp" => 1,
                ];
                $columns[] = $field;
            }

            $identifiers = ['kundeliefnr', 'kunde_lief'];
            $toUpdate = ['kundeliefbez1', 'aktiv_inaktiv', 'telefon', 'email'];
            $queryInfo =  [
                "columns" => $columns, // which should be inserted
                "identifiers" => $identifiers, // based on this identifiers we will update if match found
                "to_update" => $toUpdate // this fields will be updated
            ];

            $allQueryForCustomerAndSupplier[] = $queryInfo;
        });
        return $allQueryForCustomerAndSupplier;
    }

    public static function machineGroup($type)
    {
        $machineGroups = MachineGroup::get()->toArray();
        $columns = [];

        foreach ($machineGroups as $machineGroup) {
            $fields = [
                "name" => $machineGroup['name'],
                "type" => $type,
                "value" => $machineGroup['custom_id'],
                "is_erp_" => 1
            ];
            $columns[] = $fields;
        }

        $identifiers = ['value', 'type'];
        $toUpdate = ['name'];
        return [
            "columns" => $columns, // which should be inserted
            "identifiers" => $identifiers, // based on this identifiers we will update if match found
            "to_update" => $toUpdate // this fields will be updated
        ];
    }

    public static function order()
    {
        $allQueryForProdOrders = [];
        ProdOrder::with([
            'prodOrderPos.prodOrderPosOperations.machine',
            'prodOrderPos.prodOrderPosOperations.tool',
            'prodOrderPos.item'
        ])->whereNot('order_type', ProdOrderType::PROPOSED()->value)
            ->chunk(env('DATA_CHUNK_SIZE'), function (Collection $orders) use (&$allQueryForProdOrders) {

                $t_auf_columns = [];
                $t_auf_teile_columns = [];

                foreach ($orders as $order) {
                    foreach ($order->prodOrderPos as $order_pos) {
                        $unique_machines = [];
                        foreach ($order_pos->prodOrderPosOperations as $order_pos_op_plan_pos) {
                            if ($order_pos_op_plan_pos->status == ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                                $plan_pos_status = 30;
                            } else if ($order_pos_op_plan_pos->status == ProdOrderPosOperationStatus::TERMINATED() || $order_pos_op_plan_pos->status == ProdOrderPosOperationStatus::CLOSED() || $order_pos_op_plan_pos->status == ProdOrderPosOperationStatus::DELETED()) {
                                $plan_pos_status = 99;
                            } else {
                                $plan_pos_status = 10;
                            }

                            // Convert UTC to local timezone(Europe/Berlin) for ICT
                            $convertedTimeZone = 'Europe/Berlin';
                            if (env('EXTERNAL_DS_TARGET') == 'ict' || env('EXTERNAL_DS_TARGET') == 'ict_test') {
                                $start = $order_pos_op_plan_pos['start'] ? Carbon::parse($order_pos_op_plan_pos['start'], 'UTC')->setTimezone($convertedTimeZone) : new \DateTime();
                                $end = $order_pos_op_plan_pos['end'] ? Carbon::parse($order_pos_op_plan_pos['end'], 'UTC')->setTimezone($convertedTimeZone) : new \DateTime();
                            }else {
                                $start = $order_pos_op_plan_pos['start'] ?? new \DateTime();
                                $end = $order_pos_op_plan_pos['end'] ?? new \DateTime();
                            }

                            $field = [
                                "auf_nr" => $order['custom_id'] . "|" . $order_pos_op_plan_pos['pos'],
                                "auf_nr_alt" => $order['custom_id'],
                                "ende" => $end,
                                "start_date" => $start,
                                "total" => $order_pos_op_plan_pos['quantity'] ?: $order_pos['quantity'],
                                "pro_per_sec" => $order_pos_op_plan_pos['te'],
                                "setup_time" => $order_pos_op_plan_pos['tr'],
                                "m" => $order_pos_op_plan_pos['machine']['custom_id'] ?? '',
                                "wkz_nr" => $order_pos_op_plan_pos['tool']['custom_id'] ?? '',
                                "nest" => $order_pos_op_plan_pos['cavity'],
                                "arbgang" => $order_pos_op_plan_pos['pos'],
                                "status" => $plan_pos_status,
                                "teil" => $order_pos['item']['custom_id'],
                                "teile_bez" => $order_pos['item']['name'],
                                "bez" => $order_pos_op_plan_pos['machine']['name'] ?? '',
                                "wkz_bez" => $order_pos_op_plan_pos['tool']['name'] ?? '',
                                "halle" => '',
                                "startp" => '',
                                "endp" => '',
                                "gefmenge" => $order_pos_op_plan_pos['registered_quantity'],
                                "percentage" => '',
                                "nutzungsgrad" => 0,
                                "comment" => '',
                                "start_lieferung_erp" => '',
                                "ende_lieferung_erp" => '',
                                "linked_with" => '',
                            ];

                            $t_auf_teile_columns[] = [
                                "auf_nr" => $order['custom_id'] . "|" . $order_pos_op_plan_pos['pos'],
                                "m" => $field['m'],
                                "teile_nr" => $order_pos['item']['custom_id'],
                                "teile_bez" => $order_pos['item']['name']
                            ];

                            /*if (!in_array($field['m'], $unique_machines)) {
                                $unique_machines[] = $field['m'];
                            }*/
                            $t_auf_columns[] = $field;
                        }

                        /*foreach ($unique_machines as $machine) {
                            $t_auf_teile_columns[] = [
                                "auf_nr" => $order['custom_id'],
                                "m" => $machine,
                                "teile_nr" => $order_pos['item']['custom_id'],
                                "teile_bez" => $order_pos['item']['name']
                            ];
                        }*/
                    }
                }

                $queryInfo = [
                    't_auftrag_info' => [
                        "columns" => $t_auf_columns, // which should be inserted
                        "identifiers" => [ // based on this identifiers we will update if match found
                            'auf_nr',
                            'm',
                            'arbgang'
                        ],
                        "to_update" => [ // this fields will be updated
                            'ende',
                            'start_date',
                            'pro_per_sec',
                            'setup_time',
                            'm',
                            'arbgang',
                            'teil',
                            'teile_bez',
                            'bez',
                            'total',
                            'wkz_nr',
                            'wkz_bez',
                            'status',
                            'nest'
                        ]
                    ],
                    't_auftrag_teile_info' => [
                        "columns" => $t_auf_teile_columns, // which should be inserted
                        "identifiers" => [ // based on this identifiers we will update if match found
                            'auf_nr',
                            'm',
                            'teile_nr'
                        ],
                        "to_update" => [ // this fields will be updated
                            'teile_bez'
                        ]
                    ]
                ];

                $allQueryForProdOrders[] = $queryInfo;
            });

        return $allQueryForProdOrders;
    }

    /**
     * Prepare data to build query for base_visu tables
     *
     * @return array
     */
    public static function tool()
    {
        $allQueryForTools = [];
        Tool::chunk(env('DATA_CHUNK_SIZE'), function (Collection $tools) use (&$allQueryForTools) {
            $colums = [];
            foreach ($tools as $tool) {
                $field = [
                    "aktiv_inaktiv" => $tool['is_active'] ?? 0,
                    "werkzeugbez1" => $tool['name'] ?? '',
                    "werkzeugnr" => $tool['custom_id'],
                    "artikel_erp" => '',
                    "artikelkodex" => '',
                    "auswerfer" => '',
                    "batchanteil" => '',
                    "baugruppe" => '',
                    "baujahr" => $tool['construction_year'] ?? '',
                    "bemerkung" => '',
                    "bemerkung_hauptinfo" => '',
                    "breite" => $tool['width'] ?? '',
                    "durchmesser" => '',
                    "ebene" => $tool['storage_level'] ?? '',
                    "einbauhoehe" => '',
                    "fach" => $tool['storage_compartment'] ?? '',
                    "fewicht_feste_seite" => '',
                    "formordnernr" => '',
                    "garant_stuckzahl" => $tool['guaranteed_quantity'] ?? 0,
                    "gebene" => '',
                    "gesamtgewicht" => $tool['total_weight'] ?? '',
                    "gewicht_fahrende_seite" => '',
                    "gfach" => '',
                    "gregal" => '',
                    "heisskanal" => '',
                    "hoehe" => $tool['height'] ?? '',
                    "is_erp" => 1,
                    "kavitat" => $tool['cavity'] ?? '',
                    "kernzuege" => '',
                    "kundennr" => '',
                    "laenge" => $tool['length'] ?? '',
                    "lagerplatz" => $tool['storage_location'] ?? '',
                    "letztes_jahr" => '',
                    "marke" => '',
                    "maschine" => '',
                    "materialgruppe" => '',
                    "materialnr" => '',
                    "multi_kuplung" => '',
                    "nester" => $tool['cavity'] ?? '',
                    "ppcopo" => '',
                    "ppcoporandom" => '',
                    "pphomo" => '',
                    "projektnr" => '',
                    "regal" => $tool['storage_shelf'] ?? '',
                    "regranulat" => '',
                    "schliesskraft" => '',
                    "sonstiges" => 0,
                    "teile_gewicht" => '',
                    "teilenr" => '',
                    "toolingmanrfirst" => '',
                    "toolingmanrsecond" => '',
                    "toolingmanrthird" => '',
                    "tpe" => '',
                    "verkauf_teil" => '',
                    "werkzeug_generation" => '',
                    "zentrierring" => '',
                    "zustand" => '',
                ];
                $colums[] = $field;
            }

            $identifiers = ['werkzeugnr'];
            $toUpdate = ['werkzeugbez1', 'nester', 'kavitat'];
            if (env('EXTERNAL_DS_TARGET') === 'vop') {
                $toUpdate = ['werkzeugbez1', 'nester', 'kavitat', 'garant_stuckzahl', 'lagerplatz', 'regal', 'ebene', 'fach'];
            }
            $queryInfo = [
                "columns" => $colums, // which should be inserted
                "identifiers" => $identifiers, // based on this identifiers we will update if match found
                "to_update" => $toUpdate // this fields will be updated
            ];
            $allQueryForTools[] = $queryInfo;
        });
        return $allQueryForTools;
    }


    public static function machine()
    {
        if (env('DELETE_WHEN_SYNC_DATA') == true) {
            $allData = Machine::where('is_active', 1)->get()->toArray();
        } else {
            $allData = Machine::get()->toArray();
        }

        $externalDSTarget = env('EXTERNAL_DS_TARGET');
        $columns = [];

        foreach ($allData as $data) {
            $is_enabled_tpm_visu = SectionActivatable::where([
                'activatable_type' => Machine::class,
                'activatable_id' => $data['id'],
                'section' => SectionActivatableTypes::TPMVISU()
            ])->first();

            if ($is_enabled_tpm_visu) {
                $is_enabled_tpm_visu = $is_enabled_tpm_visu->is_active;
            } else {
                $is_enabled_tpm_visu = 0;
            }
            $customMachineGroupId = '';
            $machineGroup = MachineGroup::where('id', isset($data['machine_group_id']) ? $data['machine_group_id'] : '')
                ->first();
            $customMachineGroupId = $machineGroup ? $machineGroup->custom_id : '';

            if($externalDSTarget == 'vop') {
                $machine = DB::connection('base_visu')
                    ->table('sd_maschine')
                    ->where('maschinenr', '=', $data['custom_id'])
                    ->select('maschinengruppe')
                    ->first();

                if ($machine) {
                    $customMachineGroupId = $machine->maschinengruppe ?? $customMachineGroupId;
                }
            }

            $machineGroupIdFromBaseVisu = $customMachineGroupId; // as we are using t_base_combo.id as our custom_id in v11.

            $hall = Hall::where('id', isset($data['hall_id']) ? $data['hall_id'] : '')
                ->first();
            $hallCustomId = $hall ? $hall->custom_id : '';

            $hallIdFromBaseVisu = '';
            if ($hallCustomId) {
                $hall = DB::connection('base_visu')
                    ->table('sd_halle')
                    ->where('hallenr', '=', $hallCustomId)
                    ->select('id')
                    ->first();

                $hallIdFromBaseVisu = $hall ? $hall->id : '';
            }

            $customTpmSubGroupId = '';
            $tpmSubGroup = TpmSubGroup::where('id', isset($data['tpm_sub_group_id']) ? $data['tpm_sub_group_id'] : '')
                ->first();
            $customTpmSubGroupId = $tpmSubGroup ? $tpmSubGroup->custom_id : '';

            $tpmSubGroupIdFromBaseVisu = '';
            if ($customTpmSubGroupId) {
                $tpmSubGroup = DB::connection('base_visu')
                    ->table('t_base_combo')
                    ->where('type', '=', 3)
                    ->where('custom_id', '=', $customTpmSubGroupId)
                    ->select('id')
                    ->first();

                $tpmSubGroupIdFromBaseVisu = $tpmSubGroup ? $tpmSubGroup->id : '';
            }

            $fields = [
                "aktiv_inaktiv" => $data['is_active'],
                "arbeitsgang_id" => '',
                "auss_color_below" => 0,
                "ausschuss" => 0,
                "ausschuss_percenatge" => 0,
                "automatisiert" => 0,
                "baujahr" => $data['construction_year'] ?? '',
                "bediener" => 0,
                "capacity" => 0,
                "castvisu" => 0,
                "daqconf" => '',
                "daqlocation" => '',
                "daqtime" => 0,
                "daqtype" => '',
                "docvisu" => 0,
                "half_automatic" => 0,
                "halle" => $hallIdFromBaseVisu,
                "hersteller" => '',
                "is_casting_machine" => $data['is_casting_machine'] ?? 0,
                "is_erp" => 1,
                "is_furnace" => $data['is_furnace'] ?? 0,
                "isnutzgrad" => 0,
                "kosten_percentage" => 0,
                "leanvisu" => 0,
                // Column curently not available in ZI
                //"machine_dashboard" => 0,
                "masch_code" => '',
                "maschinenbez" => $data['name'],
                "maschinengruppe" => $machineGroupIdFromBaseVisu,
                "maschinengruppe_rep" => '',
                "maschinengruppe_tpm" => $tpmSubGroupIdFromBaseVisu,
                "maschinenr" => $data['custom_id'],
                "mesvisu" => 0,
                "modell" => '',
                "nutzgrad" => 0,
                "nutzung_color_below" => 0,
                "nutzung_percentage" => 0,
                "nutzungstatus" => 0,
                "oee" => 0,
                "oee_100" => 0,
                "oee_color_below" => 0,
                "oee_percentage" => 0,
                "order_pool" => 0,
                "planvisu" => 0,
                "processvisu" => 0,
                "prod_color_below" => 0,
                "prod_percentage" => 0,
                "produktivitaet" => 0,
                "produktivitaet_100" => 0,
                "prodvisu" => 0,
                "qualivisu" => 0,
                "rusten" => 0,
                "shiftvisu" => 0,
                "stillstand_popup_flag" => 0,
                "stillstand_sec" => 0,
                "stundensatz" => 0,
                "synchronization" => 0,
                "taskvisu" => 0,
                "tpmvisu" => $is_enabled_tpm_visu,
                "verteilzeit" => 0,
            ];
            $columns[] = $fields;
        }

        $identifiers = ['maschinenr'];
        return [
            "columns" => $columns, // which should be inserted
            "identifiers" => $identifiers, // based on this identifiers we will update if match found
        ];
    }

    /**
     * Prepare data to build query for base_visu tables
     *
     * @return array
     */
    public static function user()
    {
        $externalDSTarget = env('EXTERNAL_DS_TARGET');
        $allQueryForUsers = [];
        User::chunk(env('DATA_CHUNK_SIZE'), function (Collection $items) use (&$allQueryForUsers, $externalDSTarget) {
            $colums = [];
            foreach ($items as $item) {
                // Initialize $emailForV10 with the email value from the item array (default email for V10).
                $emailForV10 = $item['email'] ?? '';
                $passwordForV10 = $item['password'] ?? '';
                $standardPassSet = 1; 
                // only for Adoksan client
                if($externalDSTarget == 'adk_v2') {
                    /**
                     * Query the 'sd_mitarbeiter' table in the 'base_visu' connection to find the first record
                     * where 'mitarbeiternr' matches the 'custom_id' from the current item.
                     * We only select the 'email' field and assign the result to $emailRecord.
                     */
                    $emailRecord = DB::connection('base_visu')
                                ->table('sd_mitarbeiter')
                                ->where('mitarbeiternr', $item['custom_id'])
                                ->select('email', 'password', 'standard_pass_set')
                                ->first();

                    // If an email is found in the 'sd_mitarbeiter' table, overwrite $emailForV10 with the found email.
                    if ($emailRecord) {
                        $emailForV10 = $emailRecord->email ?? $emailForV10;
                        $passwordForV10 = $emailRecord->password ?? $passwordForV10;
                        $standardPassSet = $emailRecord->standard_pass_set;
                    }
                }
                
                $field = [
                    "abteilung" => "",
                    "aktiv_inaktiv" => $item['is_active'] ?? 0,
                    "altersklassen" => "",
                    "austritt" => "",
                    "bemerkung" => "",
                    "bereich" => "",
                    "berufsbez" => "",
                    "chip_number" => $item['chip_number'] ?? '',
                    "company" => 0,
                    "eintritt" => "",
                    "email" => $emailForV10,
                    "geburtsdatum" => "",
                    "geschlecht" => "",
                    "hallenr" => "",
                    "is_erp" => 1,
                    "kuerzel" => $item['user_short_code'],
                    "leantechniker" => 0,
                    "ma_art" => "",
                    "ma_gruppe" => "",
                    "mitarbeiter_type" => 0,
                    "mitarbeiterbez" => $item['name'],
                    "mitarbeiternr" => $item['custom_id'],
                    "nfc_chip_login_flag" => 0,
                    "password" => $passwordForV10,
                    "prozesstechniker" => 0,
                    "standard_pass_set" => $standardPassSet,
                    "stunden_flag" => 0,
                    "stundensatz" => 0,
                    "username" => $item['username'] ?? $item['custom_id'],
                    "vollzeit_teilzeit" => 0,
                    "vorgesetzter" => "",
                    "vorgesetzter_flag" => 0,
                    "wkz_zeit" => 0,
                    "wochenstunden" => 0,
                ];
                $colums[] = $field;
            }

            $identifiers = ['mitarbeiternr'];
            $toUpdate = ['mitarbeiterbez', 'aktiv_inaktiv', 'username', 'password', 'chip_number', 'email', 'kuerzel'];
            $queryInfo = [
                "columns" => $colums, // which should be inserted
                "identifiers" => $identifiers, // based on this identifiers we will update if match found
                "to_update" => $toUpdate // this fields will be updated
            ];
            $allQueryForUsers[] = $queryInfo;
        });
        return $allQueryForUsers;
    }

    public static function machineState()
    {
        $machineStates = MachineState::get()->toArray();
        $columns = [];

        foreach ($machineStates as $machineState) {
            $fields = [
                "name" => $machineState['name'],
                "value" => 100000 + $machineState['id'],
                "custom_id" => $machineState['custom_id'],
                "anzeigen" => $machineState['is_active'] ?? 1,
                "halle_id" => 1,
                "gruppe_id" => 1,
                "is_erp" => 1
            ];
            $columns[] = $fields;
        }

        $identifiers = ['custom_id'];
        $toUpdate = ['name'];
        return [
            "columns" => $columns, // which should be inserted
            "identifiers" => $identifiers, // based on this identifiers we will update if match found
            "to_update" => $toUpdate // this fields will be updated
        ];
    }

    public static function itemStates($type)
    {
        if($type == 21) {
            $itemStates = ItemState::where('item_state_type', ItemStateType::SCRAP()->value)->get()->toArray();
        }else {
            $itemStates = ItemState::get()->toArray();
        }
        
        $columns = [];

        foreach ($itemStates as $itemState) {
            $fields = [
                "name" => $itemState['name'],
                "value" => $itemState['custom_id'],
                "custom_id" => $itemState['custom_id'],
                "color" => $itemState['is_active'] ?? 1,
                "type" => $itemState['item_state_type'] == ItemStateType::SCRAP() ? 21 : '',
                "is_erp_" => 1
            ];
            $columns[] = $fields;
        }

        $identifiers = ['custom_id'];
        $toUpdate = ['name', 'value', 'color'];
        return [
            "columns" => $columns, // which should be inserted
            "identifiers" => $identifiers, // based on this identifiers we will update if match found
            "to_update" => $toUpdate // this fields will be updated
        ];
    }

    public static function departments($type)
    {
        if (env('DELETE_WHEN_SYNC_DATA') == true) {
            $departmentsWithHalls = Department::where('is_active', 1)->with('halls:id')->get()->toArray();
        } else {
            $departmentsWithHalls = Department::with('halls:id')->get()->toArray();
        }
        $columns = [];

        foreach ($departmentsWithHalls as $departmentsWithHall) {
            $hallIds = [];
            foreach ($departmentsWithHall['halls'] as $hall) {
                $hallIds[] = $hall['id'];
            }

            $hallIdsAsText = implode(",", $hallIds);
            $fields = [
                "name" => $departmentsWithHall['name'],
                'type' => $type,
                'goal_line_value' => '',
                'color' => 0,
                'dept_id' => $hallIdsAsText,
                'is_erp_' => 1,
                'is_edited_' => 0,
                'value' => $departmentsWithHall['custom_id'],
                'custom_id' => $departmentsWithHall['custom_id']
            ];
            $columns[] = $fields;
        }

        $identifiers = ['custom_id', 'type'];
        $toUpdate = ['name', 'dept_id'];
        return [
            "columns" => $columns, // which should be inserted
            "identifiers" => $identifiers, // based on this identifiers we will update if match found
            "to_update" => $toUpdate // this fields will be updated
        ];
    }

    public static function shiftModels()
    {
        $shiftModels = ShiftModel::leftJoin('shifts', 'shift_models.id', '=', 'shifts.shift_model_id')
            ->select('shift_models.custom_id', 'shift_models.name', DB::raw('count(shifts.shift_model_id) as shift_count'))
            ->groupBy('shift_models.custom_id', 'shift_models.name')
            ->get()
            ->toArray();
        $columns = [];

        foreach ($shiftModels as $shiftModel) {
            $fields = [
                "id" => $shiftModel['custom_id'],
                "shift_name" => $shiftModel['name'],
                "shift_color" => '',
                "shift_count" => $shiftModel['shift_count'],
                "total_hours" => 24,
                "calculate" => 1,
                "is_active" => 1,
            ];
            $columns[] = $fields;
        }

        $identifiers = ['id'];
        $toUpdate = ['shift_name', 'shift_color', 'shift_count', 'total_hours', 'calculate'];
        return [
            "columns" => $columns, // which should be inserted
            "identifiers" => $identifiers, // based on this identifiers we will update if match found
            "to_update" => $toUpdate // this fields will be updated
        ];
    }

    public static function shifts()
    {
        $shiftDetails = Shift::get()->toArray();
        $columns = [];
        foreach ($shiftDetails as $shiftDetail) {
            $shiftModel = ShiftModel::where('id', $shiftDetail['shift_model_id'])->first();
            $fields = [
                "shift_name" => $shiftDetail['name'],
                "shift_id" => $shiftModel ? $shiftModel->custom_id : null,
                "shift_code" => $shiftDetail['custom_id'],
                "starttime" => $shiftDetail['start_time'],
                "endtime" => $shiftDetail['end_time'],
                "total_hours" => $shiftDetail['hours'],
                "calculate" => $shiftDetail['is_capacity_relevant'],
                "break_time" => 0,
            ];
            $columns[] = $fields;
        }

        $identifiers = ['shift_code'];
        $toUpdate = ['shift_name', 'shift_id', 'starttime', 'endtime', 'total_hours', 'calculate', 'break_time'];
        return [
            "columns" => $columns, // which should be inserted
            "identifiers" => $identifiers, // based on this identifiers we will update if match found
            "to_update" => $toUpdate // this fields will be updated
        ];
    }

    public static function tpmGroups()
    {
        if (env('DELETE_WHEN_SYNC_DATA') == true) {
            $tpmGroups = TpmGroup::where('is_active', 1)->get()->toArray();
        } else {
            $tpmGroups = TpmGroup::get()->toArray();
        }
        $columns = [];

        foreach ($tpmGroups as $tpmGroup) {
            $columns[] = [
                'name' => $tpmGroup['name'],
                'type' => 28, // v10 tpm group type is 28
                'is_erp_' => 1,
                'custom_id' => $tpmGroup['custom_id'],
                'value' => $tpmGroup['custom_id']
            ];
        }

        return [
            "columns" => $columns,
            "identifiers" => ['value', 'type'],
            'to_update' => ['name']
        ];
    }

    public static function tpmSubGroups()
    {
        if (env('DELETE_WHEN_SYNC_DATA') == true) {
            $tpmSubGroups = TpmSubGroup::where('is_active', 1)->get()->toArray();
        } else {
            $tpmSubGroups = TpmSubGroup::get()->toArray();
        }
        $columns = [];

        /**
         * shuvo
         * in the job section
         * for importing tpm sub groups we need tpm goups id form t_base_combo
         * Not the id from our laravel tpm_groups table
         * In our machine section we iterate over each machine
         * then we find the machine group id from t_base_combo
         * Time complexity will be very bad in that case
         * To optimize my solution
         * I will first map id_name from laravel table
         * Ex. tpmGroupIdNameMap[id] = name like this
         * this will help me to find name in constant time
         * Now every tpm sub group has tpm group id
         * from our map we get name of tpm group
         * we will find the id of that tpm group from t_base_combo with this name
         *
         * To achieve this I'll make another map to find id in constant time
         * Ex. tpmGroupNameIdMap[name(from_t_base_combo)] = id(from t_base_combo)
         *
         * TODO: SAME THING SHOULD BE DONE IN MACHINE SECTION
         */

        $tpmGroups = TpmGroup::get()->toArray();

        // this will map id to name in laravel table
        $tpmGroupIdNameMap = [];
        foreach ($tpmGroups as $tpmGroup) {
            $tpmGroupIdNameMap[$tpmGroup['id']] = $tpmGroup['name'];
        }

        $baseVisuConnection = DB::connection('base_visu');

        // take tpm group data from t_base_combo
        $tpmGroupsFromBaseVisuComboTables = $baseVisuConnection->table('t_base_combo')
            ->where('type', '=', 28)
            ->get()
            ->toArray();

        // this will map name to id for t_base_combo
        $tpmGroupNameIdMap = [];
        foreach ($tpmGroupsFromBaseVisuComboTables as $tpmGroupFromBaseVisuComboTables) {
            $tpmGroupNameIdMap[$tpmGroupFromBaseVisuComboTables->name] = $tpmGroupFromBaseVisuComboTables->id;
        }

        foreach ($tpmSubGroups as $tpmSubGroup) {
            // each tpmSubGroup has an id of tpm group
            // find name from id in laravel table
            $tpmGroupName = isset($tpmGroupIdNameMap[$tpmSubGroup['tpm_group_id']]) ? $tpmGroupIdNameMap[$tpmSubGroup['tpm_group_id']] : NULL;
            // now we have name to id map from t_base_combo
            // we will use it
            $tpmGroupIdFromTBaseCombo = $tpmGroupName ? (isset($tpmGroupNameIdMap[$tpmGroupName]) ? $tpmGroupNameIdMap[$tpmGroupName] : NULL) : NULL;
            $columns[] = [
                'name' => $tpmSubGroup['name'],
                'type' => 3,
                'is_erp_' => 1,
                'value' => $tpmGroupIdFromTBaseCombo ?? '',
                // custom_id field added for unique identification 
                // for existing data we have populated custom_id field with (id_type) to make column unique
                'custom_id' => $tpmSubGroup['custom_id']
            ];
        }

        return [
            "columns" => $columns,
            "identifiers" => ['custom_id', 'type'],
            'to_update' => ['name', 'value']
        ];
    }
}
