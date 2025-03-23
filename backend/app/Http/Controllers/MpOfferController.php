<?php
namespace App\Http\Controllers;

use App\Enums\MPOffer\MPCostGroup;
use App\Enums\MPOffer\MPCostSubGroup;
use App\Enums\MPOffer\MPCostType;
use App\Models\Customer;
use App\Models\MpCostMachine;
use App\Models\MpOffer;
use App\Models\MpOfferPos;
use App\Models\MpPersonnel;
use Illuminate\Http\Request;
use Carbon\Carbon;
use DateTime;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use PDF;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\File;

class MpOfferController extends Controller
{
    public $offer;

    public function _construct()
    {
        $this->offer = new MpOffer();
    }

    public function store(Request $request)
    {
        $mpOffer = new MpOffer();
        // $mpOffer->custom_id = IdGeneratorController::generateId('MPOffer');
        $mpOffer->date = Carbon::now();

        // Client request 11.07.2024
        $mpOffer->surplus_material = 0.08; 
        $mpOffer->surplus_external = 0.08; 
        $mpOffer->surplus_internal = 0.08; 
        $mpOffer->surplus_internal_personnel = 0.08; 
        $mpOffer->surplus_internal_machine = 0.08;
        $mpOffer->surplus_total = 0.08; 

        $mpOffer->is_cloned = false; 
        $mpOffer->is_saved = false; 
        $mpOffer->save();
        $mpOffer->createOfferPos();

        return $mpOffer;
    }

    public function duplicate(MpOffer $offer)
    {
        $mpOffer = $offer->replicate();
        $mpOffer->custom_id = NULL; 
        $mpOffer->parent_offer_id = $offer->id; 
        $mpOffer->version = MpOffer::where('custom_id', $offer->custom_id)->max('version') + 1; // Get highest version
        $mpOffer->project_nr = ""; //  Copies Existing Project Nr
        $mpOffer->user_id = null; // Not Copies Responsible
        $mpOffer->date = now();
        $mpOffer->is_closed = false;
        $mpOffer->is_cloned = true; 
        $mpOffer->is_saved = false; 
        $mpOffer->push();

        $this->replicateOfferPos($offer, $mpOffer);
        $this->copyOfferMedia($offer, $mpOffer);

        return array('offer' => $mpOffer);
    }

    public function copy(MpOffer $offer)
    {
        $mpOffer = $offer->replicate();
        // $mpOffer->custom_id = IdGeneratorController::generateId('MPOffer');
        $mpOffer->custom_id = NULL; 
        $mpOffer->parent_offer_id = $offer->id; 
        $mpOffer->project_nr = ""; // Not Copies Existing Project Nr
        $mpOffer->user_id = null; // Not Copies Responsible
        $mpOffer->version = 0;
        $mpOffer->date = now();
        $mpOffer->is_closed = false;
        $mpOffer->is_cloned = true; 
        $mpOffer->is_saved = false; 
        $mpOffer->push();

        $this->replicateOfferPos($offer, $mpOffer, true);
        $this->copyOfferMedia($offer, $mpOffer);

        return array('offer' => $mpOffer);
    }

    public function generatePDF(Request $request, $id, $lang)
    {
        app()->setLocale($lang);
        session()->put('locale', $lang);

        $data = [];

        try {
            $offer = MpOffer::find($id);

            $offer['material_cost_total'] = number_format($offer->getTotalSubGroup(MPCostSubGroup::MATERIAL_INTERNAL()), 2, ',', '.');
            $offer['raw_material_total'] = number_format($offer->getTotalSubGroup(MPCostSubGroup::MATERIAL_ACQUIRED()), 2, ',', '.');
            $offer['technical_office_total'] = number_format($offer->getTotalSubGroup(MPCostSubGroup::INTERNAL_TECH_OFFICE()), 2, ',', '.');
            $offer['machining_total'] = number_format($offer->getTotalSubGroup(MPCostSubGroup::INTERNAL_MACHINING()), 2, ',', '.');
            $offer['erosion_total'] = number_format($offer->getTotalSubGroup(MPCostSubGroup::INTERNAL_EROSION()), 2, ',', '.');
            $offer['assembly_total'] = number_format($offer->getTotalSubGroup(MPCostSubGroup::INTERNAL_ASSEMBLY()), 2, ',', '.');
            $offer['sampling_total'] = number_format($offer->getTotalSubGroup(MPCostSubGroup::INTERNAL_SAMPLING()), 2, ',', '.');
            $offer['quality_control_total'] = number_format($offer->getTotalSubGroup(MPCostSubGroup::INTERNAL_QUALITY()), 2, ',', '.');

            $offer['material_total']  = number_format($offer->getTotalGroup(MPCostGroup::MATERIAL()), 2, ',', '.');
            $offer['internal_total']  = number_format($offer->getTotalGroup(MPCostGroup::INTERNAL()), 2, ',', '.');
            $offer['external_total']  = number_format($offer->getTotalGroup(MPCostGroup::EXTERNAL()), 2, ',', '.');

            $offer['technical_office_person_total'] = number_format($offer->getTotalPersonCosts(MPCostSubGroup::INTERNAL_TECH_OFFICE()), 2, ',', '.');
            $offer['machining_person_total'] = number_format($offer->getTotalPersonCosts(MPCostSubGroup::INTERNAL_MACHINING()), 2, ',', '.');
            $offer['erosion_person_total'] = number_format($offer->getTotalPersonCosts(MPCostSubGroup::INTERNAL_EROSION()), 2, ',', '.');
            $offer['assembly_person_total'] = number_format($offer->getTotalPersonCosts(MPCostSubGroup::INTERNAL_ASSEMBLY()), 2, ',', '.');
            $offer['sampling_person_total'] = number_format($offer->getTotalPersonCosts(MPCostSubGroup::INTERNAL_SAMPLING()), 2, ',', '.');
            $offer['quality_control_person_total'] = number_format($offer->getTotalPersonCosts(MPCostSubGroup::INTERNAL_QUALITY()), 2, ',', '.');

            $offer['technical_office_mach_total'] = number_format($offer->getTotalMachineCosts(MPCostSubGroup::INTERNAL_TECH_OFFICE()), 2, ',', '.');
            $offer['machining_mach_total'] = number_format($offer->getTotalMachineCosts(MPCostSubGroup::INTERNAL_MACHINING()), 2, ',', '.');
            $offer['erosion_mach_total'] = number_format($offer->getTotalMachineCosts(MPCostSubGroup::INTERNAL_EROSION()), 2, ',', '.');
            $offer['assembly_mach_total'] = number_format($offer->getTotalMachineCosts(MPCostSubGroup::INTERNAL_ASSEMBLY()), 2, ',', '.');
            $offer['sampling_mach_total'] = number_format($offer->getTotalMachineCosts(MPCostSubGroup::INTERNAL_SAMPLING()), 2, ',', '.');
            $offer['quality_control_mach_total'] = number_format($offer->getTotalMachineCosts(MPCostSubGroup::INTERNAL_QUALITY()), 2, ',', '.');

            $offer['internal_personal_total']  = number_format($offer->getAllPersonCosts(), 2, ',', '.');
            $offer['internal_machine_total']  = number_format($offer->getAllMachineCosts(), 2, ',', '.');

            $offer['tech_office_per_hour_total'] = $offer->getTotalPersonHours(MPCostSubGroup::INTERNAL_TECH_OFFICE());
            $offer['machining_per_hour_total'] = $offer->getTotalPersonHours(MPCostSubGroup::INTERNAL_MACHINING());
            $offer['erosion_per_hour_total'] = $offer->getTotalPersonHours(MPCostSubGroup::INTERNAL_EROSION());
            $offer['assembly_per_hour_total'] = $offer->getTotalPersonHours(MPCostSubGroup::INTERNAL_ASSEMBLY());
            $offer['sampling_per_hour_total'] = $offer->getTotalPersonHours(MPCostSubGroup::INTERNAL_SAMPLING());
            $offer['quality_con_per_hour_total'] = $offer->getTotalPersonHours(MPCostSubGroup::INTERNAL_QUALITY());

            $offer['tech_office_mach_hour_total'] = $offer->getTotalMachineHours(MPCostSubGroup::INTERNAL_TECH_OFFICE());
            $offer['machining_mach_hour_total'] = $offer->getTotalMachineHours(MPCostSubGroup::INTERNAL_MACHINING());
            $offer['erosion_mach_hour_total'] = $offer->getTotalMachineHours(MPCostSubGroup::INTERNAL_EROSION());
            $offer['assembly_mach_hour_total'] = $offer->getTotalMachineHours(MPCostSubGroup::INTERNAL_ASSEMBLY());
            $offer['sampling_mach_hour_total'] = $offer->getTotalMachineHours(MPCostSubGroup::INTERNAL_SAMPLING());
            $offer['quality_con_mach_hour_total'] = $offer->getTotalMachineHours(MPCostSubGroup::INTERNAL_QUALITY());

            $offer['tech_office_total_hours'] = $offer->getTotalHours(MPCostSubGroup::INTERNAL_TECH_OFFICE());
            $offer['machining_total_hours'] = $offer->getTotalHours(MPCostSubGroup::INTERNAL_MACHINING());
            $offer['erosion_total_hours'] = $offer->getTotalHours(MPCostSubGroup::INTERNAL_EROSION());
            $offer['assembly_total_hours'] = $offer->getTotalHours(MPCostSubGroup::INTERNAL_ASSEMBLY());
            $offer['sampling_total_hours'] = $offer->getTotalHours(MPCostSubGroup::INTERNAL_SAMPLING());
            $offer['quality_con_total_hours'] = $offer->getTotalHours(MPCostSubGroup::INTERNAL_QUALITY());

            $offer['internal_person_total_hours'] = $offer->getTotalSummaryPersonalHours();
            $offer['internal_machine_total_hours'] = $offer->getTotalSummaryMachineHours();
            $offer['internal_total_hours'] = $offer->getTotalInternalHours();

            $offer['offer_total']  = number_format($offer->getTotal(), 2, ',', '.');
            $offer['price_with_surplus'] = number_format($offer->getTotalSurplus(), 2, ',', '.');
            $offer['total_surplus_perc'] = round($offer->getTotalSurplusPercentage());
            $offer['margin_total'] = number_format($offer->getMargin(), 2, ',', '.');
            $offer['margin_perc'] = number_format($offer->getMarginPercentage(), 2, ',', '.');
            $offer['total_sales'] = number_format($offer->getTotalSalesPrice(), 2, ',', '.');

            $offer['surplus_material'] = number_format($offer->getSurplusMaterial(), 2, ',', '.');
            $offer['surplus_internal'] = number_format($offer->getSurplusInternal(), 2, ',', '.');
            $offer['surplus_external'] = number_format($offer->getSurplusExternal(), 2, ',', '.');
            $offer['surplus_total'] = number_format($offer->getSurplusTotal(), 2, ',', '.');
            $offer['surplus_internal_personnel'] = number_format($offer->getSurplusInternalPerson(), 2, ',', '.');
            $offer['surplus_internal_machine'] = number_format($offer->getSurplusInternalMachine(), 2, ',', '.');

            $data['mpOffer'] = $offer->toArray();
            $offerDate = new DateTime($data['mpOffer']['date']);
            $data['mpOffer']['date'] = $offerDate->format('d/m/Y');

            $data['mpOffer']['image'] = null;
            $timages = Media::get()->where('model_id', $id)->toArray();
            if ($timages != []) {
                $offerImage = array();
                foreach($timages as $img) {
                    if($img['is_selected'] == 1) {
                        $offerImage = $img;
                        break;
                    }
                } 
                if($offerImage == []) {
                    $offerImage = Media::get()->where('model_id', $id)->first()->toArray();
                } 
                $strcut = strstr($offerImage['original_url'], 'storage');
                if(File::exists(public_path($strcut))) {
                    $data['mpOffer']['image'] = base64_encode(file_get_contents(public_path($strcut)));
                }
            }

            $data['mpOffer']['customer'] = [];
            $data['mpOffer']['final_customer'] = [];
            if ($data['mpOffer']['customer_id']) {
                $customer = Customer::find($data['mpOffer']['customer_id']);
                if ($customer) $data['mpOffer']['customer'] = $customer->toArray();
                else  $data['mpOffer']['customer'] = null;
            }

            if ($data['mpOffer']['final_customer_id']) {
                $customer = Customer::find($data['mpOffer']['final_customer_id']);
                if ($customer) $data['mpOffer']['final_customer'] = $customer->toArray();
                else  $data['mpOffer']['final_customer'] = null;
            }

            $offerPos = MpOfferPos::get()->where('mp_offer_id', $id)->load('machine', 'mpCost', 'mpMaterial', 'supplier');
            foreach ($offerPos as $offerPo) {
                $offerPo['showRow'] = $offerPo->isRowShow($offerPo);

                if ($offerPo['cost_type'] == "OFFER") {
                    $dateTime = new DateTime($offerPo['supplier_offer_date']);
                    $offerPo['supplier_offer_date'] = $dateTime->format('d/m/Y');
                }

                $offerPo['showMachineName'] = false;
                if ($offerPo['cost_type'] == "HOURS" || $offerPo['cost_type'] == "HOURS_FIXED") {
                    $mpCostMach = MpCostMachine::where('mp_cost_id', $offerPo['mp_costs_id'])->get()->toArray();
                    if (sizeof($mpCostMach) > 1) {
                        $offerPo['showMachineName'] = true;
                    }
                }
            }
            $data['mpOffer']['mp_offer_pos'] = $offerPos->toArray();

            $localeID = '';
            if($lang == 'en') $localeID = 'en-EN';
            elseif($lang == 'de') $localeID = 'de-DE';
            elseif($lang == 'it') $localeID = 'it-IT';
            elseif($lang == 'tr') $localeID = 'tr-TR';

            setlocale(LC_TIME, $localeID);
            $current_dateTime = new DateTime(now());
            $today = $current_dateTime->format('d.m.Y');
            $current_dateTime = $current_dateTime->format('d M Y H:i');
            $current_dateTime = ucwords(strftime("%d %B %Y %H:%M", strtotime($current_dateTime)));
            setlocale(LC_TIME, $localeID.".utf8");

            $pageSettings = array(
                'main-details' => 'MP-Offer',
                'hasHeader' => true,
                'showHeaderTitle' => false,
                'applyHeaderBorder' => true,
                'header-title' => trans('messages.mpOfferPdf.header.title'),
                'header-subTitle' => '',
                'showWaterMark' => false,
                'showScherTechLogo' => false,
                'showClientLogo' => true,
                'clientLogoUrl' => '/images/mpLogo.png',
                'showHeaderTitleTable' => false,
                'isCustomFooter' => true,
                'current_date' => $today,
                'current_time' => $current_dateTime,
                'showFooterImage' => false,
                'showFooterDetails' => false,
                'showSimpleFooter' => false,
                'showPoweredBy' => false,
                'pdfCreatedBy' => '',
                'pdfCheckedBy' => '',
                'pdfReleasedBy' => '',
                'pdfVersion' => 'V 1.0',
                'validity' => Carbon::now(),
                'location' => '',
                'footer_page_text' => trans('messages.pdfDetails.footer.page')
            );

            $pdf = PDF::setPaper('a4', 'portrait');
            $pdf->setOptions([
                'isPhpEnabled' => true,
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
                'isFontSubsettingEnabled' => true,
                'setIsTransparent' => true,
                'fontDir' => storage_path('fonts/'),
                'fontCache' => storage_path('fonts/'),
                'defaultFont' => 'Arial',
                'memory_limit' => '512M'
            ]);

            $pdf->loadView('index', ['pageSettings' => $pageSettings, 'viewData' => $data['mpOffer']])->render();
            App::setLocale(config('app.locale'));

            return $pdf->download('mp-offer-' . Carbon::now()->format('Y-m-d') . '-' . $id . '.pdf');
        } catch (\Throwable $th) {
            Log::error($th);
        }
    }

    /**
     * @param MpOffer $offer  // parent offer  
     * @param MpOffer $mpOffer  // child offer 
     */
    public function replicateOfferPos(MpOffer $parentOffer, MpOffer $childOffer, bool $shouldUpdatePrice = false)
    {
        foreach ($parentOffer->mpOfferPos as $offerPos) {
            $cpOfferPos = $offerPos->replicate();
            $cpOfferPos->mp_offer_id = $childOffer->id;

            if ($shouldUpdatePrice) {
                if ($cpOfferPos->cost_type == MPCostType::HOURS()) {
                    $cpOfferPos->personnel_price = MpPersonnel::where('cost_sub_group', $cpOfferPos->cost_sub_group)->first()?->price;
                    $cpOfferPos->machine_price = $offerPos->machine ? $offerPos->machine->price : 0;
                    $cpOfferPos->total = ((($cpOfferPos->machine_quantity ?? 0) + ($cpOfferPos->personnel_quantity ?? 0)) * ($cpOfferPos->machine_price ?? 0) + ($cpOfferPos->personnel_quantity ?? 0) * ($cpOfferPos->personnel_price ?? 0));
                } else if ($cpOfferPos->cost_type == MPCostType::HOURS_FIXED()) {
                    $cpOfferPos->personnel_price = MpPersonnel::where('cost_sub_group', $cpOfferPos->cost_sub_group)->first()?->price;
                    $cpOfferPos->machine_price = $offerPos->machine ? $offerPos->machine->price : 0;
                    $cpOfferPos->total = (($cpOfferPos->personnel_quantity ?? 0) * ($cpOfferPos->machine_price ?? 0) + ($cpOfferPos->personnel_quantity ?? 0) * ($cpOfferPos->personnel_price ?? 0));
                } else if ($cpOfferPos->cost_type == MPCostType::DIMENSION()) {
                    $cpOfferPos->price = $offerPos->mpMaterial ? $offerPos->mpMaterial->price : null;
                    $cpOfferPos->total = ((($cpOfferPos->length ?? 0) * ($cpOfferPos->height ?? 0) * ($cpOfferPos->width ?? 0) * ($cpOfferPos->getPrice() ?? 0) * ($cpOfferPos->getDensity() ?? 0)) / 1000000);
                }
            }

            $cpOfferPos->created_at = Carbon::now();
            $cpOfferPos->updated_at = null;
            $cpOfferPos->save();
        }
        $this->checkFixedRows($childOffer->id); 
    }

    public function copyOfferMedia(MpOffer $offer, MpOffer $mpOffer) {
        $image = $offer->getMedia("*");
        if ($image != []) {
            foreach($image as $img) { 
                $location = strstr($img['original_url'], 'storage');
                $mpOffer->copyMedia($location)->toMediaCollection();
            }
        } 
    }

    public function checkFixedRows($id) {
        $matPrimeRows = MpOfferPos::where('mp_offer_id', $id)->where('cost_sub_group', MPCostSubGroup::MATERIAL_INTERNAL())->where('cost_type', MPCostType::FIXED())->get();
        $matAcqRows = MpOfferPos::where('mp_offer_id', $id)->where('cost_sub_group', MPCostSubGroup::MATERIAL_ACQUIRED())->where('cost_type', MPCostType::FIXED())->get();
        $extRows = MpOfferPos::where('mp_offer_id', $id)->where('cost_sub_group', MPCostSubGroup::EXTERNAL())->where('cost_type', MPCostType::FIXED())->get();

        if(sizeof($matPrimeRows) > 3) {
            foreach ($matPrimeRows->slice(3) as $row) {
                $row->delete();
            }
        }

        if(sizeof($matAcqRows) > 3) {
            foreach ($matAcqRows->slice(3) as $row) {
                $row->delete();
            }
        }

        if(sizeof($extRows) > 3) {
            foreach ($extRows->slice(3) as $row) {
                $row->delete();
            }
        }
    }
}