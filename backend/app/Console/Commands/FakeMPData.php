<?php

namespace App\Console\Commands;

use App\Enums\MPOffer\MPCostGroup;
use App\Enums\MPOffer\MPCostSubGroup;
use App\Enums\MPOffer\MPCostType;
use App\Models\Customer;
use App\Models\IdGeneratorSetting;
use App\Models\Machine;
use App\Models\MpCost;
use App\Models\MpCostMachine;
use App\Models\MpMaterial;
use App\Models\MpPersonnel;
use App\Models\Supplier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FakeMPData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fake_mp:seed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'executes fake data for Mouldplast tables';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {
            MpMaterial::create(['custom_id' => 'None', 'name' => '', 'density' => 0, 'price' => 0]);
            MpMaterial::create(['custom_id' => '1.1730', 'name' => '1.1730', 'density' => 7.9, 'price' => 1.8]);
            MpMaterial::create(['custom_id' => '1.2311', 'name' => '1.2311', 'density' => 7.9, 'price' => 2.5]);
            MpMaterial::create(['custom_id' => '1.2312', 'name' => '1.2312', 'density' => 7.9, 'price' => 2.7]);
            MpMaterial::create(['custom_id' => '1.2343', 'name' => '1.2343', 'density' => 7.9, 'price' => 4.5]);
            MpMaterial::create(['custom_id' => '1.2343 ESU', 'name' => '1.2343 ESU', 'density' => 7.9, 'price' => 6.5]);
            MpMaterial::create(['custom_id' => '1.2738', 'name' => '1.2738', 'density' => 7.9, 'price' => 3]);
            MpMaterial::create(['custom_id' => '1.2738 HH', 'name' => '1.2738 HH', 'density' => 7.9, 'price' => 3.5]);
            MpMaterial::create(['custom_id' => 'CuCoNiBe', 'name' => 'CuCoNiBe', 'density' => 9, 'price' => 32.5]);
            MpMaterial::create(['custom_id' => 'Mouldmax', 'name' => 'Mouldmax', 'density' => 9, 'price' => 90]);
            MpMaterial::create(['custom_id' => 'Alluminio', 'name' => 'Alluminio', 'density' => 2.7, 'price' => 6.8]);
            MpMaterial::create(['custom_id' => 'Grafite', 'name' => 'Grafite', 'density' => 1.8, 'price' => 30.5]);
            MpMaterial::create(['custom_id' => 'Rame', 'name' => 'Rame', 'density' => 9, 'price' => 30]);
            MpMaterial::create(['custom_id' => 'TQ1', 'name' => 'TQ1', 'density' => 7.9, 'price' => 7.9]);
            MpMaterial::create(['custom_id' => 'CS1', 'name' => 'CS1', 'density' => 7.9, 'price' => 10.6]);
            MpMaterial::create(['custom_id' => 'Vidar Superior', 'name' => 'Vidar Superior', 'density' => 7.9, 'price' => 9.8]);
            MpMaterial::create(['custom_id' => 'Orvar Supreme', 'name' => 'Orvar Supreme', 'density' => 7.9, 'price' => 11.7]);
            MpMaterial::create(['custom_id' => 'Dievar', 'name' => 'Dievar', 'density' => 7.9, 'price' => 12]);
            MpMaterial::create(['custom_id' => '1.2713-14', 'name' => '1.2713-14', 'density' => 7.9, 'price' => 6.5]);

            MpPersonnel::create(['custom_id' => 'TECH', 'name' => 'Ufficio tecnico', 'cost_sub_group' => MPCostSubGroup::INTERNAL_TECH_OFFICE(), 'price' => 31]);
            MpPersonnel::create(['custom_id' => 'MACH', 'name' => 'Produzione', 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'price' => 31]);
            MpPersonnel::create(['custom_id' => 'ERO', 'name' => 'Produzione', 'cost_sub_group' => MPCostSubGroup::INTERNAL_EROSION(), 'price' => 31]);
            MpPersonnel::create(['custom_id' => 'ASS', 'name' => 'Produzione', 'cost_sub_group' => MPCostSubGroup::INTERNAL_ASSEMBLY(), 'price' => 31]);
            MpPersonnel::create(['custom_id' => 'SAM', 'name' => 'Produzione', 'cost_sub_group' => MPCostSubGroup::INTERNAL_SAMPLING(), 'price' => 31]);
            MpPersonnel::create(['custom_id' => 'QUA', 'name' => 'Produzione', 'cost_sub_group' => MPCostSubGroup::INTERNAL_QUALITY(), 'price' => 31]);

            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Tasselli figura']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Tasselli colata']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Tasselli speciali']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Tasselli speciali']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Tasselli carro']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Tasselli carro']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Corpi carro']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Corpi carro']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Sfiatatori']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Portastampo PF']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Portastampo PM']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Castello']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::DIMENSION(), 'name' => 'Elettrodi']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_INTERNAL(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);

            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::PF_PM(), 'name' => 'Piastra isolante']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Normalizzati stampo']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Normalizzati pezzo']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::PIECES(), 'name' => 'Cilindri idr. Standard']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::PIECES(), 'name' => 'Cilindri idr. interni']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Raccorderia idraulica']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Sistema iniezione plastica']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Sistema iniezione gomma']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Sistema di condizionamento']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Collegamenti elettrici']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Viteria']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Materiale da Magazzino MP']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::WEIGHT(), 'name' => 'Materiale per campionatura']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);
            MpCost::create(['cost_group' => MPCostGroup::MATERIAL(), 'cost_sub_group' => MPCostSubGroup::MATERIAL_ACQUIRED(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);

            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::MOULDFLOW(), 'name' => 'Mouldflow']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::FIXED_WEIGHT(), 'name' => 'Trattamenti termici']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::OFFER(), 'name' => 'Portastampo C.to Lav.']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Tornitura']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Lucidatura']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Fotoincisione']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::OFFER(), 'name' => 'Progetto stampo']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::OFFER(), 'name' => 'Costruzione stampo']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::OFFER(), 'name' => 'Campionatura']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Trasporti interni (For)']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::FIXED_NAME(), 'name' => 'Trasporti esterni (Cli)']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);
            MpCost::create(['cost_group' => MPCostGroup::EXTERNAL(), 'cost_sub_group' => MPCostSubGroup::EXTERNAL(), 'cost_type' => MPCostType::FIXED(), 'name' => '']);


            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_TECH_OFFICE(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'CAD sistemz.pezzo/SM']);
            $m = Machine::create(['custom_id' => '120', 'name' => 'CAD Top Solid - progetto st', 'price'=> 11]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_TECH_OFFICE(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'CAD progett. stampo']);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_TECH_OFFICE(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'CAD elettrodi']);
            $m = Machine::create(['custom_id' => '130', 'name' => 'CAD Top Solid - elettrodi', 'price'=> 11]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_TECH_OFFICE(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'CAD adattamenti per produzione']);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_TECH_OFFICE(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Documentazione']);
            $m = Machine::create(['custom_id' => '96', 'name' => 'Documentazione', 'price'=> 11]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);

            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'CAM']);
            $m = Machine::create(['custom_id' => '200', 'name' => 'CAM Fresa', 'price'=> 10.8]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Fresatura CME']);
            $m = Machine::create(['custom_id' => '230', 'name' => 'Fresa Cme', 'price'=> 42.9]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Fresatura Fidia']);
            $m = Machine::create(['custom_id' => '220', 'name' => 'Fresa Fidia', 'price'=> 38.3]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Fresatura DMG']);
            $m = Machine::create(['custom_id' => '260', 'name' => 'DMC1150V', 'price'=> 34.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Fresatura Mecof']);
            $m = Machine::create(['custom_id' => '210', 'name' => 'Fresa Mecof', 'price'=> 43.6]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Fresatura GF']);
            $m = Machine::create(['custom_id' => '270', 'name' => 'GF Mill E 700 U', 'price'=> 36.2]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'CAM elettrodi']);
            $m = Machine::create(['custom_id' => '300', 'name' => 'CAM Elettrodi', 'price'=> 10.8]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Fresatura elettrodi Fidia']);
            $m = Machine::create(['custom_id' => '320', 'name' => 'Fresa Elettrodi Fidia ', 'price'=> 38.3]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_MACHINING(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Preparazione particolari']);
            $m_p = Machine::create(['custom_id' => '960', 'name' => 'Preparazione particolari', 'price'=> 23.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m_p->id]);

            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_EROSION(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Ero-tuffo GF P 900']);
            $m = Machine::create(['custom_id' => '515', 'name' => 'GF Form P 900 (tuffo)', 'price'=> 32]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_EROSION(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Ero-tuffo AEG']);
            $m = Machine::create(['custom_id' => '510', 'name' => 'Erosione AEG grande (tuffo)', 'price'=> 16]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_EROSION(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Ero-filo CUT 550']);
            $m = Machine::create(['custom_id' => '540', 'name' => 'GF CUT P 550 (filo)', 'price'=> 27.3]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_EROSION(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Preparazione particolari']);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m_p->id]);

            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_ASSEMBLY(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Forature e raffr.']);
            $m = Machine::create(['custom_id' => '810', 'name' => 'Foratrice Degen', 'price'=> 23.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_ASSEMBLY(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Tornitura']);
            $m = Machine::create(['custom_id' => '640', 'name' => 'Tornio', 'price'=> 23.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_ASSEMBLY(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Lucidatura']);
            $m = Machine::create(['custom_id' => '950', 'name' => 'Lucidatura', 'price'=> 23.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_ASSEMBLY(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Saldatura']);
            $m = Machine::create(['custom_id' => '930', 'name' => 'Saldatura laser', 'price'=> 23.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_ASSEMBLY(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Banco / assemblaggio']);
            $m = Machine::create(['custom_id' => '920', 'name' => 'Banco', 'price'=> 23.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_ASSEMBLY(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Logistica / Magazzino']);
            $m = Machine::create(['custom_id' => '990', 'name' => 'Logistica / Magazzino', 'price'=> 10]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);

            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_SAMPLING(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Campionatura funzionale (< 30 pezzi)']);
            $m = Machine::create(['custom_id' => '981', 'name' => 'Campionatura <400T', 'price'=> 23.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_SAMPLING(), 'cost_type' => MPCostType::HOURS(), 'name' => 'Stampaggio (campionatura)']);
            $m = Machine::create(['custom_id' => '9705', 'name' => 'REMU_HS_150', 'price'=> 28]);
            $m2 = Machine::create(['custom_id' => '9712', 'name' => 'MIR_RMPE_675', 'price'=> 75]);
            $m3 = Machine::create(['custom_id' => '9714', 'name' => 'MIR_RMPE_1250', 'price'=> 94]);
            $m4 = Machine::create(['custom_id' => '9716', 'name' => 'Pressa_MIR_RMPE_380', 'price'=> 42]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m2->id]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m3->id]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m4->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_SAMPLING(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Stampaggio']);
            $m = Machine::create(['custom_id' => '970', 'name' => 'Stampaggio produzione', 'price'=> 10]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_SAMPLING(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Assistenza campionatura da cliente o fornitore']);
            $m = Machine::create(['custom_id' => '980', 'name' => 'Campionatura assistenza', 'price'=> 10]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);

            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_QUALITY(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Controllo Qualità']);
            $m_q = Machine::create(['custom_id' => '40', 'name' => 'Controllo qualità', 'price'=> 23.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_QUALITY(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Zeiss UMC 850']);
            $m = Machine::create(['custom_id' => '41', 'name' => 'Zeiss UMC 850', 'price'=> 23.7]);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m->id]);
            $c = MpCost::create(['cost_group' => MPCostGroup::INTERNAL(), 'cost_sub_group' => MPCostSubGroup::INTERNAL_QUALITY(), 'cost_type' => MPCostType::HOURS_FIXED(), 'name' => 'Controlli dimensionali pezzo']);
            MpCostMachine::create(['mp_cost_id' => $c->id, 'machine_id' => $m_q->id]);

            Machine::create(['custom_id' => '110', 'name' => 'CAD Catia', 'price'=> 11]);
            Machine::create(['custom_id' => '50', 'name' => 'Pulizia', 'price'=> 11]);
            Machine::create(['custom_id' => '60', 'name' => 'Manutenzione', 'price'=> 11]);
            Machine::create(['custom_id' => '70', 'name' => 'Formazione', 'price'=> 11]);
            Machine::create(['custom_id' => '71', 'name' => 'Tutor', 'price'=> 11]);
            Machine::create(['custom_id' => '90', 'name' => 'Riunione', 'price'=> 11]);
            Machine::create(['custom_id' => '95', 'name' => 'Offerte', 'price'=> 11]);
            Machine::create(['custom_id' => '530', 'name' => 'Erosione CDM', 'price'=> 16]);
            Machine::create(['custom_id' => '550', 'name' => 'Microforatura DRILL 20', 'price'=> 32]);
            Machine::create(['custom_id' => '710', 'name' => 'Rettifica grande', 'price'=> 23.7]);
            Machine::create(['custom_id' => '720', 'name' => 'Rettifica piccola', 'price'=> 23.7]);
            Machine::create(['custom_id' => '820', 'name' => 'Foratrice San Rocco', 'price'=> 23.7]);
            Machine::create(['custom_id' => '830', 'name' => 'Trapani a colonna', 'price'=> 23.7]);
            Machine::create(['custom_id' => '910', 'name' => 'Aggiustaggi', 'price'=> 23.7]);
            Machine::create(['custom_id' => '940', 'name' => 'Saldatura TIG/Gas', 'price'=> 23.7]);
            Machine::create(['custom_id' => '982', 'name' => 'Campionatura >400T', 'price'=> 23.7]);
            Machine::create(['custom_id' => '999', 'name' => 'Altro', 'price'=> 23.7]);

            IdGeneratorSetting::create(["entity" => "MpOffer", "table" => "mp_offers", "prefix" => "MP-", "field" => "custom_id", "length" => 8]);

            Log::info("Mouldplast data seeding completed successfully!");
        } catch (\Throwable $th) {
            Log::error($th);
        }
        return 0;
    }
}