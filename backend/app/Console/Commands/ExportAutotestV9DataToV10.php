<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PDO;

class ExportAutotestV9DataToV10 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "app:export-autotest-v9-data-to-v10";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Command description";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // TPMVisu Data export
        // ----------------
        // $this->batchInsertLogs();
        // $this->tpmAttachment();
        // $this->tpmAttachmentHistory();
        // $this->tpmHistoryDataList();
        // $this->tpmHistoryValueColor();
        // $this->tpmInputDataList();
        // $this->tpmInpuInputTyps();
        // $this->tpmInpuInpuValueColors();
        // $this->tpmJobList();
        // $this->tpmMachines();
        // $this->tpmOccurences();
        // $this->tpmReponsible();
        // $this->tpmData();


        // -------------------------

        // Not needed anymore
        // $this->updateMaschIdInInsertLog();

        // Not needed anymore
        // $this->updateMaschIdInTpmData();

        // Not needed anymore
        // $this->updateMaschIdInJobList();
        
        // Not needed anymore
        // $this->updateMaschGroupIdTpmData();


        // To update the masch_group_id in t_tpm_data table
        // Should run everyday
        // $this->updateMaschGroupIdTpmData();

        // ShiftVisu Data export
        // ----------------

        // $this->shiftVisuTComponentType();
        // $this->shiftVisuTFehler();
        // $this->shiftVisuTFehlerComponents();
        // $this->shiftVisuTFehlerComponentsOption();
        // $this->shiftVisuTFehlerSettings();
        // $this->shiftVisuTFehlerGeneralSettings();
        // $this->shiftVisuTFehlerWorkplan();
        // $this->shiftVisuTFehlerWorkplanDocs();

        // $this->updateTFehlerHalleId();
        // $this->updateTFehlerDepartmentId();
        // $this->updateWorkPlanHalleId(); 
        // $this->updateWorkPlanAbteilungId();
        // SELECT * FROM `t_workplan`


        // Should be put into cronjon
        // $this->updateMaschGroupIdTpmData();


        // Base Visu adjustment 
        // $this->updateTBaseComboDeptId();
        // Deprecated function
        // $this->mergeEmployeeData();

        // Not needed anymore
        // $this->updateMaschinengruppeTpmIds();

        $this->info("Data export completed successfully.");
    }

    public function updateMaschGroupIdTpmData() {}

    public function mergeEmployeeData()
    {
        $distinctIds = [];

        $newServerUserList = DB::connection('base_visu')
            ->table('sd_mitarbeiter')
            ->pluck('mitarbeiternr');

        foreach ($newServerUserList as $list) {
            $distinctIds[] = $list;
        }

        $oldServerUserListNotExported = DB::connection('old_base_visu')
            ->table('sd_mitarbeiter')
            ->whereNot('mitarbeiternr', '')
            ->whereNotIn('mitarbeiternr', $distinctIds)
            ->get();

        $values = [];

        foreach ($oldServerUserListNotExported as $list) {
            $values[] = [
                'mitarbeiternr' => $list->mitarbeiternr,
                'mitarbeiterbez' => $list->mitarbeiterbez,
                'username' => $list->username,
                'password' => $list->password,
                'email' => $list->email,
                'aktiv_inaktiv' => $list->aktiv_inaktiv,
                'ma_art' => $list->ma_art,
                'bereich' => '',  // Assuming this is a static value
                'bemerkung' => $list->bemerkung,
                'abteilung' => $list->abteilung,
                'company' => 0,  // Assuming this is a static value
                'wochenstunden' => $list->wochenstunden,
                'stundensatz' => $list->stundensatz,
                'eintritt' => $list->eintritt,
                'austritt' => $list->austritt,
                'hallenr' => $list->hallenr,
                'berufsbez' => $list->berufsbez,
                'ma_gruppe' => $list->ma_gruppe,
                'vollzeit_teilzeit' => $list->vollzeit_teilzeit,
                'vorgesetzter_flag' => $list->vorgesetzter_flag,
                'vorgesetzter' => $list->vorgesetzter,
                'vorgesetzter2' => '',  // Assuming this is a static value
                'geburtsdatum' => '',  // Assuming this is a static value
                'geschlecht' => $list->geschlecht,
                'altersklassen' => $list->altersklassen,
                'kuerzel' => $list->kuerzel,
                'wkz_zeit' => $list->wkz_zeit,
                'prozesstechniker' => $list->prozesstechniker,
                'mitarbeiter_type' => $list->mitarbeiter_type,
                'leantechniker' => $list->leantechniker,
                'stunden_flag' => $list->stunden_flag,
            ];
        }
        DB::connection('base_visu')
            ->table('sd_mitarbeiter')
            ->upsert(
                $values,
                ['mitarbeiternr'], // Columns that are unique
                [                  // Columns that should be updated on conflict
                    'mitarbeiterbez',
                    'username',
                    'password',
                    'email',
                    'aktiv_inaktiv',
                    'ma_art',
                    'bereich',
                    'bemerkung',
                    'abteilung',
                    'company',
                    'wochenstunden',
                    'stundensatz',
                    'eintritt',
                    'austritt',
                    'hallenr',
                    'berufsbez',
                    'ma_gruppe',
                    'vollzeit_teilzeit',
                    'vorgesetzter_flag',
                    'vorgesetzter',
                    'vorgesetzter2',
                    'geburtsdatum',
                    'geschlecht',
                    'altersklassen',
                    'kuerzel',
                    'wkz_zeit',
                    'prozesstechniker',
                    'mitarbeiter_type',
                    'leantechniker',
                    'stunden_flag'
                ]
            );
    }


    public function updateWorkPlanAbteilungId()
    {
        $rows = DB::connection('shift_visu')
            ->table('t_workplan')
            ->get(['id', 'abteilung_id']);


        foreach ($rows as $row) {
            // Step 2: Split the masch_id string into an array
            $abteilungIds = explode(',', $row->abteilung_id);
            $newHalleIds = [];

            foreach ($abteilungIds as $abteilung_id) {
                $abteilung_id = trim($abteilung_id);


                $customId = DB::connection('old_base_visu')
                    ->table('t_base_combo')
                    ->where('id', $abteilung_id)
                    ->value('value');


                if ($customId) {
                    // Step 4: Find the corresponding id in old_base_visu.sd_maschine
                    $tempHalleId = DB::connection('base_visu')
                        ->table('t_base_combo')
                        ->where('value', $customId)
                        ->value('id');

                    if ($tempHalleId) {
                        // Store the new id in the array
                        $newHalleIds[] = $tempHalleId;
                    } else {
                        // If no new id is found, keep the old id
                        $newHalleIds[] = $abteilung_id;
                    }
                } else {
                    // If no hallenr is found, keep the old id
                    $newHalleIds[] = $abteilung_id;
                }
            }

            // Step 5: Recombine the new ids into a comma-separated string
            $newHalleds = implode(',', $newHalleIds);

            DB::connection('shift_visu')
                ->table('t_workplan')
                ->where('id', $row->id)
                ->update(['abteilung_id' => $newHalleds]);
        }
    }

    public function updateTBaseComboDeptId()
    {
        $rows = DB::connection('base_visu')
            ->table('t_base_combo')
            ->where('type', 19)
            ->get(['id', 'dept_id']);

        foreach ($rows as $row) {

            $halleIds = explode(',', $row->dept_id);
            $newHalleIds = [];

            foreach ($halleIds as $halleId) {
                $halleId = trim($halleId);

                $customId = DB::connection()
                    ->table('halls')
                    ->where('id', $halleId)
                    ->value('custom_id');

                if ($customId) {
                    // Step 4: Find the corresponding id in old_base_visu.sd_maschine
                    $tempHalleId = DB::connection('base_visu')
                        ->table('sd_halle')
                        ->where('hallenr', $customId)
                        ->value('id');


                    if ($tempHalleId) {
                        // Store the new id in the array
                        $newHalleIds[] = $tempHalleId;
                    } else {
                        // If no new id is found, keep the old id
                        $newHalleIds[] = $halleId;
                    }
                } else {
                    // If no hallenr is found, keep the old id
                    $newHalleIds[] = $halleId;
                }
            }

            // Step 5: Recombine the new ids into a comma-separated string
            $newHalleds = implode(',', $newHalleIds);

            DB::connection('base_visu')
                ->table('t_base_combo')
                ->where('id', $row->id)
                ->update(['dept_id' => $newHalleds]);
        }
    }

    // Primary ID update

    public function updateTFehlerHalleId()
    {
        $rows = DB::connection('shift_visu')
            ->table('t_fehler')
            ->get(['id', 'halle_id']);

        foreach ($rows as $row) {
            // Step 2: Split the masch_id string into an array
            $halleIds = explode(',', $row->halle_id);
            $newIds = [];

            foreach ($halleIds as $halleId) {
                $halleId = trim($halleId);

                // Step 3: Find the corresponding maschinenr in base_visu.sd_maschine
                $customId = DB::connection('old_base_visu')
                    ->table('sd_halle')
                    ->where('id', $halleId)
                    ->value('hallenr');

                if ($customId) {
                    // Step 4: Find the corresponding id in old_base_visu.sd_maschine
                    $newId = DB::connection('base_visu')
                        ->table('sd_halle')
                        ->where('hallenr', $customId)
                        ->value('id');

                    if ($newId) {
                        // Store the new id in the array
                        $newIds[] = $newId;
                    } else {
                        // If no new id is found, keep the old id
                        $newIds[] = $halleId;
                    }
                } else {
                    // If no hallenr is found, keep the old id
                    $newIds[] = $halleId;
                }
            }

            // Step 5: Recombine the new ids into a comma-separated string
            $newHalleds = implode(',', $newIds);
            DB::connection('shift_visu')
                ->table('t_fehler')
                ->where('id', $row->id)
                ->update(['halle_id' => $newHalleds]);
        }
    }

    // Primary ID update

    public function updateTFehlerDepartmentId()
    {
        $rows = DB::connection('shift_visu')
            ->table('t_fehler')
            ->get(['id', 'departments_id']);


        foreach ($rows as $row) {

            $departmentIds = explode(',', $row->departments_id);
            $newIds = [];



            foreach ($departmentIds as $halleId) {
                $halleId = trim($halleId);

                $customId = DB::connection('old_base_visu')
                    ->table('t_base_combo')
                    ->where('id', $halleId)
                    ->where('type', 19)
                    ->value('value');

                if ($customId) {
                    // Step 4: Find the corresponding id in old_base_visu.sd_maschine
                    $newId = DB::connection('base_visu')
                        ->table('t_base_combo')
                        ->where('value', $customId)
                        ->where('type', 19)
                        ->value('id');

                    if ($newId) {
                        // Store the new id in the array
                        $newIds[] = $newId;
                    } else {
                        // If no new id is found, keep the old id
                        $newIds[] = $halleId;
                    }
                } else {
                    // If no hallenr is found, keep the old id
                    $newIds[] = $halleId;
                }
            }

            // Step 5: Recombine the new ids into a comma-separated string
            $newHalleds = implode(',', $newIds);

            DB::connection('shift_visu')
                ->table('t_fehler')
                ->where('id', $row->id)
                ->update(['departments_id' => $newHalleds]);
        }
    }

    public function updateWorkPlanHalleId()
    {
        $rows = DB::connection('shift_visu')
            ->table('t_workplan')
            ->get(['id', 'halle_id']);

        foreach ($rows as $row) {
            // Step 2: Split the masch_id string into an array
            $halleIds = explode(',', $row->halle_id);
            $newIds = [];

            foreach ($halleIds as $halleId) {
                $halleId = trim($halleId);

                // Step 3: Find the corresponding maschinenr in base_visu.sd_maschine
                $customId = DB::connection('old_base_visu')
                    ->table('sd_halle')
                    ->where('id', $halleId)
                    ->value('hallenr');

                if ($customId) {
                    // Step 4: Find the corresponding id in old_base_visu.sd_maschine
                    $newId = DB::connection('base_visu')
                        ->table('sd_halle')
                        ->where('hallenr', $customId)
                        ->value('id');

                    if ($newId) {
                        // Store the new id in the array
                        $newIds[] = $newId;
                    } else {
                        // If no new id is found, keep the old id
                        $newIds[] = $halleId;
                    }
                } else {
                    // If no hallenr is found, keep the old id
                    $newIds[] = $halleId;
                }
            }

            // Step 5: Recombine the new ids into a comma-separated string
            $newHalleds = implode(',', $newIds);
            DB::connection('shift_visu')
                ->table('t_workplan')
                ->where('id', $row->id)
                ->update(['halle_id' => $newHalleds]);
        }
    }



    public function updateMaschinengruppeTpmIds()
    {
        $machineList = DB::connection('base_visu')
            ->table('sd_maschine')
            ->get(['id', 'maschinenr', 'maschinengruppe_tpm'])
            ->toArray();

        foreach ($machineList as $machine) {
            $maschinengruppe_tpm = DB::connection('old_base_visu')
                ->table('sd_maschine')
                ->where('maschinenr', $machine->maschinenr)
                ->value('maschinengruppe_tpm');

            DB::connection('base_visu')
                ->table('sd_maschine')
                ->where('maschinenr', $machine->maschinenr)
                ->update(['maschinengruppe_tpm' => $maschinengruppe_tpm ?? 0]);
        }
    }

    public function shiftVisuTComponentType()
    {
        // t_component_type
        $components = DB::connection('old_shift_visu')
            ->table('t_component_type')
            ->get(['id', 'fehler_id', 'component_id', 'is_checked', 'details', 'option_id', 'email'])
            ->toArray();

        if (!empty($components)) {
            $values = [];

            foreach ($components as $component) {
                $values[] = [
                    'id' => $component->id,
                    'fehler_id' => $component->fehler_id,
                    'component_id' => $component->component_id,
                    'is_checked' => $component->is_checked,
                    'details' => $component->details,
                    'option_id' => $component->option_id,
                    'email' => $component->email,
                ];
            }
            DB::connection('shift_visu')
                ->table('t_component_type')
                ->insert($values);
        }
    }
    public function shiftVisuTFehler()
    {
        // t_fehler
        $components = DB::connection('old_shift_visu')
            ->table('t_fehler')
            ->get(['id', 'name', 'departments_id', 'halle_id'])
            ->toArray();

        if (!empty($components)) {
            $values = [];

            foreach ($components as $component) {
                $values[] = [
                    'id' => $component->id,
                    'name' => $component->name,
                    'departments_id' => $component->departments_id,
                    'halle_id' => $component->halle_id,
                ];
            }
            DB::connection('shift_visu')
                ->table('t_fehler')
                ->insert($values);
        }
    }
    public function shiftVisuTFehlerComponents()
    {
        // t_fehler_components
        $components = DB::connection('old_shift_visu')
            ->table('t_fehler_components')
            ->get(['id', 'name', 'multi_lang_key', 'type', 'code'])
            ->toArray();

        if (!empty($components)) {
            $values = [];

            foreach ($components as $component) {
                $values[] = [
                    'id' => $component->id,
                    'name' => $component->name,
                    'multi_lang_key' => $component->multi_lang_key,
                    'type' => $component->type,
                    'code' => $component->code,
                    'details' => '',
                ];
            }
            DB::connection('shift_visu')
                ->table('t_fehler_components')
                ->insert($values);
        }
    }
    public function shiftVisuTFehlerComponentsOption()
    {
        // t_fehler_components_options
        $components = DB::connection('old_shift_visu')
            ->table('t_fehler_components_options')
            ->get(['id', 'name', 'multi_lang_key', 'component_id'])
            ->toArray();

        if (!empty($components)) {
            $values = [];

            foreach ($components as $component) {
                $values[] = [
                    'id' => $component->id,
                    'name' => $component->name,
                    'multi_lang_key' => $component->multi_lang_key,
                    'component_id' => $component->component_id,
                ];
            }
            DB::connection('shift_visu')
                ->table('t_fehler_components_options')
                ->insert($values);
        }
    }
    public function shiftVisuTFehlerSettings()
    {
        // t_fehler_settings
        $components = DB::connection('old_shift_visu')
            ->table('t_fehler_settings')
            ->get(['id', 'fehler_id', 'is_read_all', 'halle_id', 'abteilung_id', 'is_checked'])
            ->toArray();

        if (!empty($components)) {
            $values = [];

            foreach ($components as $component) {
                $values[] = [
                    'id' => $component->id,
                    'fehler_id' => $component->fehler_id,
                    'is_read_all' => $component->is_read_all,
                    'halle_id' => $component->halle_id,
                    'abteilung_id' => $component->abteilung_id,
                    'is_checked' => $component->is_checked,
                ];
            }
            DB::connection('shift_visu')
                ->table('t_fehler_settings')
                ->insert($values);
        }
    }
    public function shiftVisuTFehlerGeneralSettings()
    {
        // t_general_settings
        $components = DB::connection('old_shift_visu')
            ->table('t_general_settings')
            ->get(['id', 'shiftvisu_via_tpmvisu'])
            ->toArray();

        if (!empty($components)) {
            $values = [];

            foreach ($components as $component) {
                $values[] = [
                    'id' => $component->id,
                    'module' => $component->shiftvisu_via_tpmvisu,
                    'status' => 1,
                ];
            }
            DB::connection('shift_visu')
                ->table('t_general_settings')
                ->insert($values);
        }
    }

    public function shiftVisuTFehlerWorkplan()
    {
        // t_workplan
        $workplans = DB::connection('old_shift_visu')
            ->table('t_workplan')
            ->get([
                'id',
                'halle_id',
                'abteilung_id',
                'fehler_id',
                'schicht_id',
                'person_nr_old',
                'person_nr',
                'error_start',
                'error_end',
                'person_sofort_nr_old',
                'person_sofort_nr',
                'maschine_nr_old',
                'maschine_nr',
                'teile_nr',
                'kunden_nr',
                'lieferant_nr',
                'error_bez',
                'error_sofort',
                'status',
                'maschine_status',
                'erledigt_status',
                'wkz_nr',
                'anlagenteil_id',
                'person_ansprech_nr_old',
                'person_ansprech_nr',
                'ursache',
                'support_nr_old',
                'support_nr',
                'informiert_id',
                'funktionstest_id',
                'fehlerart_id',
                'beruek_id',
                'plan_clone_id'
            ])
            ->toArray();

        if (!empty($workplans)) {
            $values = [];

            foreach ($workplans as $workplan) {
                $values[] = [
                    'id' => $workplan->id,
                    'halle_id' => $workplan->halle_id,
                    'abteilung_id' => $workplan->abteilung_id,
                    'abteilung_full_bez' => '',
                    'fehler_id' => $workplan->fehler_id,
                    'schicht_id' => $workplan->schicht_id,
                    'schicht_bez' => '',
                    'person_nr' => $workplan->person_nr,
                    'person_name' => '',
                    'error_start' => empty($workplan->error_start) ? now() : $workplan->error_start,
                    //  TODO: adjust error_end
                    // 'error_end' => empty($workplan->error_end) ? '' : $workplan->error_end,
                    'person_sofort_nr' => $workplan->person_sofort_nr,
                    'maschine_nr' => $workplan->maschine_nr,
                    'maschine_bez' => '',
                    // TODO: adjust teile_nr
                    'teile_nr' => $workplan->teile_nr ?? '',
                    'teile_bez' => '',
                    'kunden_nr' => $workplan->kunden_nr,
                    'kunden_bez' => '',
                    'lieferant_nr' => $workplan->lieferant_nr,
                    'lieferant_bez' => '',
                    'error_bez' => $workplan->error_bez,
                    'error_sofort' => $workplan->error_sofort,
                    'person_sofort_nr' => '',
                    'person_sofort_bez' => '',
                    'status' => $workplan->status,
                    'person_abstell_nr' => '',
                    'person_abstell_bez' => '',
                    'maschine_status' => $workplan->maschine_status,
                    'error_abstell' => '',
                    'erledigt_status' => $workplan->erledigt_status,
                    'wkz_nr' => $workplan->wkz_nr,
                    'wkz_bez' => '',
                    'anlagenteil_id' => $workplan->anlagenteil_id,
                    'anlagenteil_bez' => '',
                    'person_ansprech_nr' => $workplan->person_ansprech_nr,
                    'person_ansprech_bez' => '',
                    'ursache' => $workplan->ursache,
                    // TODO: What will be support_nr?
                    'support_nr' => $workplan->support_nr ?? 0,
                    'support_person_names' => '',
                    'informiert_id' => $workplan->informiert_id,
                    'funktionstest_id' => $workplan->funktionstest_id,
                    'fehlerart_id' => $workplan->fehlerart_id,
                    'beruek_id' => $workplan->beruek_id,
                    'plan_clone_id' => $workplan->plan_clone_id
                ];
            }

            DB::connection('shift_visu')
                ->table('t_workplan')
                ->insert($values);
        }
    }



    public function shiftVisuTFehlerWorkplanDocs()
    {
        // t_workplan_docs
        $components = DB::connection('old_shift_visu')
            ->table('t_workplan_docs')
            ->get(['doc_id', 'workplan_id', 'doc_original_name', 'doc_file_name', 'doc_size', 'doc_path', 'extension', 'upload_date', 'mimetype'])
            ->toArray();

        if (!empty($components)) {
            $values = [];

            foreach ($components as $component) {
                $values[] = [
                    'doc_id' => $component->doc_id,
                    'workplan_id' => $component->workplan_id,
                    'doc_original_name' => $component->doc_original_name,
                    'doc_file_name' => $component->doc_file_name,
                    'doc_size' => $component->doc_size,
                    'doc_path' => $component->doc_path,
                    'doc_path_pdf' => '',
                    'extension' => $component->extension,
                    'upload_date' => $component->upload_date,
                    'mimetype' => $component->mimetype,
                ];
            }
            DB::connection('shift_visu')
                ->table('t_workplan_docs')
                ->insert($values);
        }
    }


    public function batchInsertLogs()
    {
        try {
            // Step 1: Fetch data from the old connection
            $insertedLogs = DB::connection('old_tpm')
                ->table('insert_log')
                ->get(['row_id', 'id', 'job_id', 'masch_group_id', 'masch_id', 'input_date_time', 'update_date_time', 'task_occur_type', 'is_active', 'updated', 'time_inserted'])
                ->toArray();

            if (!empty($insertedLogs)) {
                // Define the chunk size
                $chunkSize = 1000; // Adjust the chunk size based on your server's capabilities

                // Step 2: Chunk the data and insert in batches
                $chunks = array_chunk($insertedLogs, $chunkSize);

                foreach ($chunks as $chunk) {
                    $values = [];

                    foreach ($chunk as $log) {
                        $values[] = [
                            'row_id' => $log->row_id,
                            'id' => $log->id,
                            'job_id' => $log->job_id,
                            'masch_group_id' => $log->masch_group_id !== null ? $log->masch_group_id : null,
                            'masch_id' => $log->masch_id,
                            'input_date_time' => $log->input_date_time,
                            'update_date_time' => $log->update_date_time,
                            'task_occur_type' => $log->task_occur_type,
                            'is_active' => $log->is_active,
                            'updated' => $log->updated,
                            'time_inserted' => $log->time_inserted,
                        ];
                    }

                    // Step 3: Perform batch insert for the current chunk
                    DB::connection('tpm')
                        ->table('insert_log')
                        ->insert($values);
                }

                return "Batch insert completed successfully.";
            } else {
                return "No data found to insert.";
            }
        } catch (\Exception $e) {
            // Handle the error and return or log the error message
            return "Error during batch insert: " . $e->getMessage();
        }
    }

    public function tpmAttachment()
    {
        // Step 1: Fetch data from the old database using the old_tpm connection
        $attachments = DB::connection('old_tpm')
            ->table('t_attachment')
            ->get(['id', 'job_id', 'file_name', 'original_name', 'type', 'ext', 'uploaded', 'size'])
            ->toArray();

        if (!empty($attachments)) {
            // Step 2: Prepare the data for batch insert
            $values = [];

            foreach ($attachments as $attachment) {
                $values[] = [
                    'id' => $attachment->id,
                    'job_id' => $attachment->job_id,
                    'file_name' => $attachment->file_name,
                    'original_name' => $attachment->original_name,
                    'type' => $attachment->type,
                    'ext' => $attachment->ext,
                    'uploaded' => $attachment->uploaded,
                    'size' => $attachment->size,
                ];
            }

            // Step 3: Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_attachment')
                ->insert($values);
        }
        return $attachments;
    }

    public function tpmAttachmentHistory()
    {
        // Step 1: Fetch data from the old database using the old_tpm connection
        $attachments = DB::connection('old_tpm')
            ->table('t_history_attachment')
            ->get(['id', 'tpm_data_id', 'file_name', 'original_name', 'type', 'ext', 'uploaded', 'size'])
            ->toArray();

        if (!empty($attachments)) {
            // Step 2: Prepare the data for batch insert
            $values = [];

            foreach ($attachments as $attachment) {
                $values[] = [
                    'id' => $attachment->id,
                    'tpm_data_id' => $attachment->tpm_data_id !== null ? $attachment->tpm_data_id : null,
                    'file_name' => $attachment->file_name,
                    'original_name' => $attachment->original_name,
                    'type' => $attachment->type,
                    'ext' => $attachment->ext,
                    'uploaded' => $attachment->uploaded,
                    'size' => $attachment->size,
                ];
            }

            // Step 3: Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_history_attachment')
                ->insert($values);
        }

        return $attachments;
    }
    public function tpmHistoryDataList()
    {
        // Step 1: Fetch data from the old database using the old_tpm connection
        $historyDataList = DB::connection('old_tpm')
            ->table('t_history_data_list')
            ->get(['id', 'name', 'job_id', 'tpm_data_id'])
            ->toArray();

        if (!empty($historyDataList)) {
            // Step 2: Prepare the data for batch insert
            $values = [];

            foreach ($historyDataList as $history) {
                $values[] = [
                    'id' => $history->id,
                    'name' => $history->name,
                    'job_id' => $history->job_id,
                    'tpm_data_id' => $history->tpm_data_id !== null ? $history->tpm_data_id : null,
                ];
            }

            // Step 3: Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_history_data_list')
                ->insert($values);
        }

        return $historyDataList;
    }

    public function tpmHistoryValueColor()
    {
        // Step 1: Fetch data from the old database using the old_tpm connection
        $historyValueColors = DB::connection('old_tpm')
            ->table('t_history_value_color')
            ->get(['id', 'job_id', 'possible_value', 'color', 'tpm_data_id'])
            ->toArray();

        if (!empty($historyValueColors)) {
            // Step 2: Prepare the data for batch insert
            $values = [];

            foreach ($historyValueColors as $historyValueColor) {
                $values[] = [
                    'id' => $historyValueColor->id,
                    'job_id' => $historyValueColor->job_id,
                    'possible_value' => $historyValueColor->possible_value,
                    'color' => $historyValueColor->color,
                    'tpm_data_id' => $historyValueColor->tpm_data_id !== null ? $historyValueColor->tpm_data_id : null,
                ];
            }

            // Step 3: Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_history_value_color')
                ->insert($values);
        }

        return $historyValueColors;
    }

    public function tpmInputDataList()
    {
        // Step 1: Fetch data from the old database using the old_tpm connection
        $inputDataList = DB::connection('old_tpm')
            ->table('t_input_data_list')
            ->get(['id', 'job_id', 'name'])
            ->toArray();

        if (!empty($inputDataList)) {
            // Step 2: Prepare the data for batch insert
            $values = [];

            foreach ($inputDataList as $inputData) {
                $values[] = [
                    'id' => $inputData->id,
                    'job_id' => $inputData->job_id,
                    'name' => $inputData->name,
                ];
            }

            // Step 3: Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_input_data_list')
                ->insert($values);
        }

        return $inputDataList;
    }

    public function tpmInpuInputTyps()
    {
        // Step 1: Fetch data from the old database using the old_tpm connection
        $inputTypes = DB::connection('old_tpm')
            ->table('t_input_type')
            ->get(['id', 'name', 'other_info', 'define_values', 'status', 'define_color'])
            ->toArray();

        if (!empty($inputTypes)) {
            // Step 2: Prepare the data for batch insert
            $values = [];

            foreach ($inputTypes as $inputType) {
                $values[] = [
                    'id' => $inputType->id,
                    'name' => $inputType->name,
                    'other_info' => $inputType->other_info,
                    'define_values' => $inputType->define_values,
                    'status' => $inputType->status,
                    'define_color' => $inputType->define_color,
                ];
            }

            // Step 3: Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_input_type')
                ->insert($values);
        }

        return $inputTypes;
    }

    public function tpmInpuInpuValueColors()
    {
        // Step 1: Fetch data from the old database using the old_tpm connection
        $inputValueColors = DB::connection('old_tpm')
            ->table('t_input_value_color')
            ->get(['id', 'job_id', 'possible_value', 'color'])
            ->toArray();

        if (!empty($inputValueColors)) {
            // Step 2: Prepare the data for batch insert
            $values = [];

            foreach ($inputValueColors as $valueColor) {
                $values[] = [
                    'id' => $valueColor->id,
                    'job_id' => $valueColor->job_id,
                    'possible_value' => $valueColor->possible_value,
                    'color' => $valueColor->color,
                ];
            }

            // Step 3: Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_input_value_color')
                ->insert($values);
        }

        return $inputValueColors;
    }

    public function tpmJobList()
    {
        // Step 1: Fetch data from the old database using the old_tpm connection
        $jobs = DB::connection('old_tpm')
            ->table('t_job_list')
            ->get([
                'id',
                'name',
                'group_id',
                'note',
                'input_type_id',
                'responsible_id',
                'task_occur_type',
                'task_occur_time',
                'shft_model_id',
                'selected_shift',
                'masch_mask',
                'status',
                'insert_date_time',
                'update_date_time',
                'last_launch_time',
            ])
            ->toArray();

        if (!empty($jobs)) {
            // Step 2: Prepare the data for batch insert
            $values = [];

            foreach ($jobs as $job) {
                $values[] = [
                    'id' => $job->id,
                    'name' => $job->name,
                    'group_id' => $job->group_id,
                    'note' => $job->note,
                    'input_type_id' => $job->input_type_id,
                    'responsible_id' => $job->responsible_id,
                    'task_occur_type' => $job->task_occur_type,
                    'task_occur_time' => $job->task_occur_time,
                    'shft_model_id' => $job->shft_model_id,
                    'selected_shift' => $job->selected_shift,
                    'masch_mask' => $job->masch_mask,
                    'status' => $job->status,
                    'insert_date_time' => $job->insert_date_time ?: null,
                    'update_date_time' => $job->update_date_time ?: null,
                    'last_launch_time' => $job->last_launch_time ?: null,
                ];
            }

            // Step 3: Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_job_list')
                ->insert($values);
        }

        // $this->updateMaschIdInJobList();

        return $jobs;
    }

    public function tpmMachines()
    {
        // Fetch data from the old database using the old_tpm connection
        $machines = DB::connection('old_tpm')
            ->table('t_maschine')
            ->get(['id', 'group_id', 'bde_nr', 'masch_name', 'bde_name', 'ip_plc', 'ip_hmi', 'status', 'order_for_group', 'position_in_mask'])
            ->toArray();

        if (!empty($machines)) {
            // Prepare the data for batch insert
            $values = [];

            foreach ($machines as $machine) {
                $values[] = [
                    'id' => $machine->id,
                    'group_id' => $machine->group_id,
                    'bde_nr' => $machine->bde_nr,
                    'masch_name' => $machine->masch_name,
                    'bde_name' => $machine->bde_name,
                    'ip_plc' => $machine->ip_plc,
                    'ip_hmi' => $machine->ip_hmi,
                    'status' => $machine->status,
                    'order_for_group' => $machine->order_for_group,
                    'position_in_mask' => $machine->position_in_mask,
                ];
            }

            // Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_maschine')
                ->insert($values);
        }

        return $machines;
    }

    public function tpmOccurences()
    {
        // Fetch data from the old database using the old_tpm connection
        $occurences = DB::connection('old_tpm')
            ->table('t_occurrence')
            ->get(['id', 'name', 'status'])
            ->toArray();

        if (!empty($occurences)) {
            // Prepare the data for batch insert
            $values = [];

            foreach ($occurences as $occurrence) {
                $values[] = [
                    'id' => $occurrence->id,
                    'name' => $occurrence->name,
                    'status' => $occurrence->status,
                ];
            }

            // Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_occurrence')
                ->insert($values);
        }

        return $occurences;
    }

    public function tpmReponsible()
    {
        // Fetch data from the old database using the old_tpm connection
        $responsibles = DB::connection('old_tpm')
            ->table('t_responsible')
            ->get(['id', 'resp_name', 'resp_color', 'resp_code', 'status'])
            ->toArray();

        if (!empty($responsibles)) {
            // Prepare the data for batch insert
            $values = [];

            foreach ($responsibles as $responsible) {
                $values[] = [
                    'id' => $responsible->id,
                    'resp_name' => $responsible->resp_name,
                    'resp_color' => $responsible->resp_color,
                    'resp_code' => $responsible->resp_code,
                    'status' => $responsible->status,
                ];
            }

            // Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_responsible')
                ->insert($values);
        }

        return $responsibles;
    }

    public function tpmData()
    {
        $skip = 0;
        $take = 1000;

        while (true) {
            // Fetch data from the old database with pagination
            $data = DB::connection('old_tpm')
                ->table('t_tpm_data')
                ->select([
                    'id',
                    'job_id',
                    'job_name',
                    'masch_group_id',
                    'masch_id',
                    'masch_name',
                    'masch_bde_id',
                    'input_date_time',
                    'update_date_time',
                    'input_value',
                    'input_other_value',
                    'input_status_color',
                    'input_doc_link',
                    'shift_name',
                    'shift_position',
                    'shift_model_id',
                    'week',
                    'month',
                    'year',
                    'full_date',
                    'responsible_id',
                    'resp_color',
                    'resp_code',
                    'resp_name',
                    'input_type_id',
                    'task_occur_type',
                    'is_active',
                    'updated',
                ])
                ->skip($skip)
                ->take($take)
                ->get()
                ->toArray();

            // Break the loop if no more data is available
            if (empty($data)) {
                break;
            }

            // Prepare the data for batch insert
            $values = [];
            foreach ($data as $record) {
                $values[] = [
                    'id' => $record->id,
                    'job_id' => $record->job_id,
                    'job_name' => $record->job_name,
                    'masch_group_id' => $record->masch_group_id ?? null,
                    'masch_id' => $record->masch_id,
                    'masch_name' => $record->masch_name,
                    'masch_bde_id' => $record->masch_bde_id,
                    'input_date_time' => $record->input_date_time,
                    'update_date_time' => $record->update_date_time,
                    'input_value' => $record->input_value,
                    'input_other_value' => $record->input_other_value,
                    'input_status_color' => $record->input_status_color,
                    'input_doc_link' => $record->input_doc_link,
                    'shift_name' => $record->shift_name,
                    'shift_position' => $record->shift_position,
                    'shift_model_id' => $record->shift_model_id,
                    'week' => $record->week,
                    'month' => $record->month,
                    'year' => $record->year,
                    'full_date' => $record->full_date,
                    'responsible_id' => $record->responsible_id,
                    'resp_color' => $record->resp_color,
                    'resp_code' => $record->resp_code,
                    'resp_name' => $record->resp_name,
                    'input_type_id' => $record->input_type_id,
                    'task_occur_type' => $record->task_occur_type,
                    'is_active' => $record->is_active,
                    'updated' => $record->updated,
                ];
            }

            // Perform batch insert into the new database using the tpm connection
            DB::connection('tpm')
                ->table('t_tpm_data')
                ->insert($values);

            // Increment the skip value for the next batch
            $skip += $take;
        }

        // Optional: Return a message or data when the process is complete
        return "Data transfer complete.";
    }

    public function updateMaschIdInInsertLog()
    {
        $distinctIds = DB::connection('tpm')
            ->table('insert_log')
            ->distinct()
            ->pluck('masch_id');

        foreach ($distinctIds as $maschId) {
            // Step 2: Find the corresponding custom_id in base_visu.sd_maschine
            $customId = DB::connection('old_base_visu')
                ->table('sd_maschine')
                ->where('id', $maschId)
                ->value('maschinenr');

            if ($customId) {
                // Step 3: Find the corresponding id in old_base_visu.sd_maschine
                $newId = DB::connection('base_visu')
                    ->table('sd_maschine')
                    ->where('maschinenr', $customId)
                    ->value('id');
                if ($newId) {
                    // Step 4: Update the masch_id in tpm.insert_log
                    DB::connection('tpm')
                        ->table('insert_log')
                        ->where('masch_id', $maschId)
                        ->update(['masch_id' => $newId]);
                }
            }
        }
    }
    public function updateMaschIdInTpmData()
    {
        $distinctIds = DB::connection('tpm')
            ->table('t_tpm_data')
            ->distinct()
            ->pluck('masch_id');

        foreach ($distinctIds as $maschId) {
            // Step 2: Find the corresponding custom_id in base_visu.sd_maschine
            $customId = DB::connection('old_base_visu')
                ->table('sd_maschine')
                ->where('id', $maschId)
                ->value('maschinenr');

            if ($customId) {
                // Step 3: Find the corresponding id in old_base_visu.sd_maschine
                $newId = DB::connection('base_visu')
                    ->table('sd_maschine')
                    ->where('maschinenr', $customId)
                    ->value('id');
                if ($newId) {
                    // Step 4: Update the masch_id in tpm.t_tpm_data
                    DB::connection('tpm')
                        ->table('t_tpm_data')
                        ->where('masch_id', $maschId)
                        ->update([
                            'masch_id' => $newId,
                            'masch_bde_id' => $newId,
                        ]);
                }
            }
        }
    }
    public function updateMaschIdInJobList()
    {
        // Step 1: Get all rows from t_job_list table
        $rows = DB::connection('tpm')
            ->table('t_job_list')
            ->get(['id', 'masch_mask']);

        foreach ($rows as $row) {
            // Step 2: Split the masch_id string into an array
            $maschIds = explode(',', $row->masch_mask);
            $newIds = [];

            foreach ($maschIds as $maschId) {
                $maschId = trim($maschId);

                // Step 3: Find the corresponding maschinenr in base_visu.sd_maschine
                $customId = DB::connection('old_base_visu')
                    ->table('sd_maschine')
                    ->where('id', $maschId)
                    ->value('maschinenr');

                if ($customId) {
                    // Step 4: Find the corresponding id in old_base_visu.sd_maschine
                    $newId = DB::connection('base_visu')
                        ->table('sd_maschine')
                        ->where('maschinenr', $customId)
                        ->value('id');

                    if ($newId) {
                        // Store the new id in the array
                        $newIds[] = $newId;
                    } else {
                        // If no new id is found, keep the old id
                        $newIds[] = $maschId;
                    }
                } else {
                    // If no maschinenr is found, keep the old id
                    $newIds[] = $maschId;
                }
            }

            // Step 5: Recombine the new ids into a comma-separated string
            $newMaschIds = implode(',', $newIds);
            // Step 6: Update the row in t_job_list table
            DB::connection('tpm')
                ->table('t_job_list')
                ->where('id', $row->id)
                ->update(['masch_mask' => $newMaschIds]);
        }
    }
}
