<?php

namespace App\Http\Controllers\HweQs;

use App\Http\Controllers\Controller;
use App\Models\HweCertificate;
use App\Models\HweMeltAnalysis;
use App\Models\HweQsCleanlinessTest;
use App\Models\HweQsGrainSizeTest;
use App\Models\HweQsHb;
use App\Models\HweQsImpactTest;
use App\Models\HweQsJominyTest;
use App\Models\HweQsMtNorm;
use App\Models\HweQsPtNorm;
use App\Models\HweQsTensileTest;
use App\Models\HweQsUsNorm;
use App\Models\HweQsVtNorm;
use App\Models\ProdOrderPosBomPos;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Pdf;

class CertificateController extends Controller
{
    public function generatePdfOrText(Request $request, $certificateId, $lang, $isText)
    {

        app()->setLocale($lang);
        session()->put('locale', $lang);
        $data = [];
        $elements = [
            'c', 'si', 'mn', 'p', 's', 'cr', 'mo', 'ni', 'v', 'ai', 'h2', 'cu', 'w', 'ti', 'co', 'b', 'o2', 'sn', 'n', 'nb', 'ca', 'zr', 'sb', 'ta', 'as',
        ];
        $purities = ['a', 'b', 'c', 'd', 'ds'];
        $variants = ['1', '1_5', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '13', '15', '20', '25', '30', '35', '40', '45', '50'];
        $variant1 = ['1_5', '3', '5', '7', '9', '11', '13', '15', '20', '25', '30', '35', '40', '45', '50'];
        $variant2 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '13', '15', '20', '25', '30'];
        $elData = ['c' => 'C', 'si' => 'Si', 'mn' => 'Mn', 'p' => 'P', 's' => 'S', 'cr' => 'Cr', 'mo' => 'Mo', 'ni' => 'Ni', 'v' => 'V', 'ai' => 'Ai', 'h2' => 'H2', 'cu' => 'Cu', 'w' => 'W', 'ti' => 'Ti', 'co' => 'Co', 'b' => 'B', 'o2' => 'O2', 'sn' => 'Sn', 'n' => 'N', 'nb' => 'Nb', 'ca' => 'Ca', 'zr' => 'Zr', 'sb' => 'Sb', 'ta' => 'Ta', 'as' => 'As'];
        $purityData = ['a' => 'A', 'b' => 'B', 'c' => 'C', 'd' => 'D', 'ds' => 'Ds'
        ];
        try {
            $localeID = '';
            if ($lang == 'en') $localeID = 'en-EN';
            elseif ($lang == 'de') $localeID = 'de-DE';
            elseif ($lang == 'it') $localeID = 'it-IT';
            elseif ($lang == 'tr') $localeID = 'tr-TR';

            setlocale(LC_TIME, $localeID);
            setlocale(LC_TIME, $localeID . ".utf8");
            $certificate = HweCertificate::with([
                'sample',
                'sample.prodOrderPosOperationsIdent:quantity,prod_order_pos_id',
                'heatTreatment.calculation.operationPlan.operationPlanPos',
                'sample.salesOrderPos.salesOrders',
                'sample.prodOrder:id,custom_id',
                'sample.calculation:id,documentation_id,non_destructive_testing_id,offer_pos_id,testing_scope_id,sales_order_pos,sales_order,operation_plan_id',
                'sample.calculation.testingScope:id,attestation,name,custom_id',
                'sample.calculation.testingScope.attestationEntities',
                'sample.calculation.offerPos:id,offer_id,material_id,item_name,drawing_id,height_final,inner_diameter_final,outer_diameter_final,customer_material_number',
                'sample.calculation.offerPos.offer.customer',
                'sample.calculation.calculationDocumentation',
                'sample.calculation.offerPos.material:id,custom_id,name',
                'sample.calculation.nonDestructiveTesting',
                'hweCertificateHweQsSamples.hweQsSample',
                'sample.prodOrderPosOperationForCertificate:id,pos,machine_id,prod_order_pos_id',
                'sample.prodOrderPosOperationForCertificate.machine:id,custom_id',
                'sample.prodOrderPosOperationForCertificate.machine:id,custom_id'

            ])
                ->where('id', $certificateId)
                ->first();

            $identIsOk = $certificate?->sample?->quantity === $certificate?->sample?->prodOrderPosOperationsIdent?->quantity;

            $pdfFile = [];
            $accessToken = $request->bearerToken();
            $token = PersonalAccessToken::findToken($accessToken);
            if ($token == null)
                return response('Unauthorized', 403);
            $tokenableUser = $token->tokenable;
            $user = User::with(['supervisorOne', 'supervisorTwo', 'roles.permissions'])->where('id', $tokenableUser->id)->first();
            $bomPos = ProdOrderPosBomPos::with('melt')->where('prod_order_pos_id', $certificate->prod_order_pos_id_qs_samples)->first();
            $melt = HweMeltAnalysis::with(['item.hweClassificationLieferant', 'item.hweClassificationGiesstyp'])->where('custom_id', $bomPos?->melt?->value_string)->first();
            $hweQsHb = HweQsHb::with(['hweQsHbPos', 'prodOrderPos.calculation.calculationTestingScope'])
                ->where('prod_order_pos_id', $certificate->prod_order_pos_id_qs_samples)->first();
            $hweQsJominy = HweQsJominyTest::where('prod_order_pos_id', $certificate->prod_order_pos_id_qs_samples)->first();
            $hweQsGrainSize = HweQsGrainSizeTest::where('prod_order_pos_id', $certificate->prod_order_pos_id_qs_samples)->first();
            $hweQsCleanlinessTest = HweQsCleanlinessTest::where('prod_order_pos_id', $certificate->prod_order_pos_id_qs_samples)->first();
            $hweQsUs = HweQsUsNorm::with(["prodOrderPos.calculation.nonDestructiveTesting.usNorm", "adjustments", "usNormTestScopes", "usNormTestSections", "usNormRatings"])->where('prod_order_pos_id', $certificate->prod_order_pos_id_ultrasonic)->first();
            $hweQsMt = HweQsMtNorm::where('prod_order_pos_id', $certificate->prod_order_pos_id_surface)->first();
            $hweQsPt = HweQsPtNorm::where('prod_order_pos_id', $certificate->prod_order_pos_id_surface)->first();
            $hweQsVt = HweQsVtNorm::where('prod_order_pos_id', $certificate->prod_order_pos_id_surface)->first();
            $pageBgImage = base64_encode(file_get_contents(public_path('/images/hwe-logo.jpg')));
            $pageSmallLogo = base64_encode(file_get_contents(public_path('/images/hwe-logo-small.jpg')));
            $countCertificate = count($certificate->hweCertificateHweQsSamples);

            if ($countCertificate) {
                foreach ($certificate->hweCertificateHweQsSamples as $key => $hweCertificateHweQsSample) {
                    [$pdf, $pageSettings] = $this->getPdfInstance();
                    $hweQsTensileTest = HweQsTensileTest::with(['hweQsSample',
                        'prodOrderPos.calculation:id,testing_scope_id', 'prodOrderPos.calculation.testingScope:id,specimen_location,a5_min,bhp_dimension,reh,rm,specimen_dimension',
                        'prodOrderPos.calculation.calculationTestingScope.accordingToTensileTests'])
                        ->where('prod_order_pos_id', $certificate->prod_order_pos_id_qs_samples)
                        ->where('hwe_qs_sample_id', $hweCertificateHweQsSample?->hweQsSample?->id)
                        ->first();

                    $hweQsImpactTest = HweQsImpactTest::with(['hweQsImpactTestPos', 'prodOrderPos.calculation.calculationTestingScope'])
                        ->where('prod_order_pos_id', $certificate->prod_order_pos_id_qs_samples)
                        ->where('hwe_qs_sample_id', $hweCertificateHweQsSample?->hweQsSample?->id)
                        ->first();

                    if ($isText) {
                        $text = view('hwe-qs.certificate-text', [
                            'certificate' => $certificate,
                            'elements' => $elements,
                            'purities' => $purities,
                            'variants' => $variants,
                            'variant1' => $variant1,
                            'setVariant' => $melt?->variant ? ($melt?->variant === 'VARIANT_1' ? $variant1 : $variant2) : null,
                            'setJominyVariant' => $hweQsJominy?->variant ? ($hweQsJominy?->variant === 'VARIANT_1' ? $variant1 : $variant2) : null,
                            'melt' => $melt,
                            "hweCertificateHweQsSample" => $hweCertificateHweQsSample,
                            "hweQsTensileTest" => $hweQsTensileTest,
                            "hweQsImpactTest" => $hweQsImpactTest,
                            "hweQsHb" => $hweQsHb,
                            "hweQsUs" => $hweQsUs,
                            "hweQsMt" => $hweQsMt,
                            "hweQsPt" => $hweQsPt,
                            "hweQsVt" => $hweQsVt,
                            "bomPos" => $bomPos,
                            "user" => $user,
                            'identIsOk' => $identIsOk,
                            'hweQsJominy' => $hweQsJominy,
                            'hweQsGrainSize' => $hweQsGrainSize,
                            'hweQsCleanlinessTest' => $hweQsCleanlinessTest,
                            "elData" => $elData,
                            "purityData" => $purityData
                        ])->render();

                        $postFix = $countCertificate > 1 ? '_' . $key + 1 : '';

                        $filename = $certificate?->sample?->prodOrder?->custom_id ? $certificate?->sample?->prodOrder?->custom_id . $postFix . "REV.$certificate->rev" . '.text' : 'test';
                        Storage::disk('public')->put("hwe-qs/certificate/$filename", $text);
                        $pdfFile[$key]['pdf'] = env('APP_URL', 'http://localhost') . "/storage/hwe-qs/certificate/$filename";
                        $pdfFile[$key]['name'] = $certificate?->sample?->prodOrder?->custom_id ? $certificate?->sample?->prodOrder?->custom_id . $postFix . '.text' : 'test';

                    } else {


                        $pdf->loadView('hwe-qs.index', ['pageSettings' => $pageSettings, 'viewData' => $data,
                            'pageSmallLogo' => $pageSmallLogo,
                            'pageBgImage' => $pageBgImage,
                            'certificate' => $certificate,
                            'elements' => $elements,
                            'purities' => $purities,
                            'variants' => $variants,
                            'variant1' => $variant1,
                            'setVariant' => $melt?->variant ? ($melt?->variant === 'VARIANT_1' ? $variant1 : $variant2) : null,
                            'setJominyVariant' => $hweQsJominy?->variant ? ($hweQsJominy?->variant === 'VARIANT_1' ? $variant1 : $variant2) : null,
                            'melt' => $melt,
                            "hweCertificateHweQsSample" => $hweCertificateHweQsSample,
                            "hweQsTensileTest" => $hweQsTensileTest,
                            "hweQsImpactTest" => $hweQsImpactTest,
                            "hweQsHb" => $hweQsHb,
                            "hweQsUs" => $hweQsUs,
                            "hweQsMt" => $hweQsMt,
                            "hweQsPt" => $hweQsPt,
                            "hweQsVt" => $hweQsVt,
                            "bomPos" => $bomPos,
                            "user" => $user,
                            'identIsOk' => $identIsOk,
                            'hweQsJominy' => $hweQsJominy,
                            'hweQsGrainSize' => $hweQsGrainSize,
                            'hweQsCleanlinessTest' => $hweQsCleanlinessTest
                        ]);

                        App::setLocale(config('app.locale'));
                        $pdfContent = $pdf->output();

                        $postFix = $countCertificate > 1 ? '_' . $key + 1 : '';

                        $filename = $certificate?->sample?->prodOrder?->custom_id ? $certificate?->sample?->prodOrder?->custom_id . $postFix . "REV.$certificate->rev" . '.pdf' : 'test';
                        Storage::disk('public')->put("hwe-qs/certificate/$filename", $pdfContent);
                        $pdfFile[$key]['pdf'] = env('APP_URL', 'http://localhost') . "/storage/hwe-qs/certificate/$filename";
                        $pdfFile[$key]['name'] = $certificate?->sample?->prodOrder?->custom_id ? $certificate?->sample?->prodOrder?->custom_id . $postFix . '.pdf' : 'test';
                    }


                }
            } else {
                if ($isText) {
                    $text = view('hwe-qs.certificate-text', [
                        'certificate' => $certificate,
                        'elements' => $elements,
                        'purities' => $purities,
                        'variants' => $variants,
                        'variant1' => $variant1,
                        'setVariant' => $melt?->variant ? ($melt?->variant === 'VARIANT_1' ? $variant1 : $variant2) : null,
                        'setJominyVariant' => $hweQsJominy?->variant ? ($hweQsJominy?->variant === 'VARIANT_1' ? $variant1 : $variant2) : null,
                        'melt' => $melt,
                        "hweCertificateHweQsSample" => null,
                        "hweQsTensileTest" => null,
                        "hweQsImpactTest" => null,
                        "hweQsHb" => $hweQsHb,
                        "hweQsUs" => $hweQsUs,
                        "hweQsMt" => $hweQsMt,
                        "hweQsPt" => $hweQsPt,
                        "hweQsVt" => $hweQsVt,
                        "bomPos" => $bomPos,
                        "user" => $user,
                        'identIsOk' => $identIsOk,
                        'hweQsJominy' => $hweQsJominy,
                        'hweQsGrainSize' => $hweQsGrainSize,
                        'hweQsCleanlinessTest' => $hweQsCleanlinessTest,
                        "elData" => $elData,
                        "purityData" => $purityData
                    ])->render();

                    $postFix = $countCertificate > 1 ? '_' . +1 : '';

                    $filename = $certificate?->sample?->prodOrder?->custom_id ? $certificate?->sample?->prodOrder?->custom_id . "REV.$certificate->rev" . '.text' : 'test.pdf';
                    Storage::disk('public')->put("hwe-qs/certificate/$filename", $text);
                    $pdfFile[0]['pdf'] = env('APP_URL', 'http://localhost') . "/storage/hwe-qs/certificate/$filename";
                    $pdfFile[0]['name'] = $certificate?->sample?->prodOrder?->custom_id ? $certificate?->sample?->prodOrder?->custom_id . $postFix . '.text' : 'test';
                } else {
                    [$pdf, $pageSettings] = $this->getPdfInstance();
                    $hweQsTensileTest = null;

                    $hweQsImpactTest = null;


                    $pdf->loadView('hwe-qs.index', ['pageSettings' => $pageSettings, 'viewData' => $data,
                        'pageSmallLogo' => $pageSmallLogo,
                        'pageBgImage' => $pageBgImage,
                        'certificate' => $certificate,
                        'elements' => $elements,
                        'purities' => $purities,
                        'variants' => $variants,
                        'variant1' => $variant1,
                        'setVariant' => $melt?->variant ? ($melt?->variant === 'VARIANT_1' ? $variant1 : $variant2) : null,
                        'setJominyVariant' => $hweQsJominy?->variant ? ($hweQsJominy?->variant === 'VARIANT_1' ? $variant1 : $variant2) : null,
                        'melt' => $melt,
                        "hweCertificateHweQsSample" => null,
                        "hweQsTensileTest" => $hweQsTensileTest,
                        "hweQsImpactTest" => $hweQsImpactTest,
                        "hweQsHb" => $hweQsHb,
                        "hweQsUs" => $hweQsUs,
                        "hweQsMt" => $hweQsMt,
                        "hweQsPt" => $hweQsPt,
                        "hweQsVt" => $hweQsVt,
                        "bomPos" => $bomPos,
                        "user" => $user,
                        'identIsOk' => $identIsOk,
                        'hweQsJominy' => $hweQsJominy,
                        'hweQsGrainSize' => $hweQsGrainSize,
                        'hweQsCleanlinessTest' => $hweQsCleanlinessTest
                    ]);

                    App::setLocale(config('app.locale'));
                    $pdfContent = $pdf->output();

                    $filename = $certificate?->sample?->prodOrder?->custom_id ? $certificate?->sample?->prodOrder?->custom_id . "REV.$certificate->rev" . '.pdf' : 'test.pdf';

                    Storage::disk('public')->put("hwe-qs/certificate/$filename", $pdfContent);

                    $pdfFile[0]['pdf'] = env('APP_URL', 'http://localhost') . "/storage/hwe-qs/certificate/$filename";
                    $pdfFile[0]['name'] = $certificate?->sample?->prodOrder?->custom_id ? $certificate?->sample?->prodOrder?->custom_id . '.pdf' : 'test.pdf';

                }
            }
            return $pdfFile;

        } catch (\Exception $exception) {
            return $exception->getMessage();
        }

    }

    protected function getPdfInstance()
    {
        $current_dateTime = new \DateTime(now());
        $today = $current_dateTime->format('d.m.Y');
        $current_dateTime = $current_dateTime->format('d M Y H:i');
        $current_dateTime = ucwords(strftime("%d %B %Y %H:%M", strtotime($current_dateTime)));
        $pageSettings = array(
            'main-details' => 'Certificate',
            'hasHeader' => true,
            'showHeaderTitle' => false,
            'applyHeaderBorder' => true,
            'header-title' => trans('messages.mpOfferPdf.header.title'),
            'header-subTitle' => '',
            'showWaterMark' => false,
            'showScherTechLogo' => false,
            'showClientLogo' => true,
            'clientLogoUrl' => '',
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
        ]);

        return [$pdf, $pageSettings];
    }
}
