<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $pageSettings['main-details'] == 'MP-Offer' ? __('messages.mpOfferPdf.title') : __('messages.pdfDetails.pageTitle') }}</title>
    <style>
        @font-face {
            font-family: Arial;
            src: url('{{ storage_path("fonts/arialmt.ttf") }}') format('truetype');
        }

        body {
            width: 794px;
            margin: 0;
            font-family: Arial, sans-serif;
        }

        .content {

            display: flex;
            flex-direction: column;
            align-items: center;
        }

        header {
            width: 703px;
            position: fixed;
            top: -20px;
            border-bottom: 1px solid #D0D7DD;
            height: 235px;

        }

        .content {
            margin-top: 5px;
        }

        table {
            font-size: 11px;
            width: 100%;
            border-collapse: collapse;
        }

        td {
            vertical-align: top;
            padding-left: 10px;
        }

        .label {
            font-weight: 500;
            color: #667085;
            width: 19%;
        }

        .table-th {
            font-weight: 500;
            color: #667085;
        }

        .table-td {
            font-weight: 500;
            color: #344054;
        }

        .value {
            font-weight: 500;
            color: #344054;
            width: 30%;
        }

        .h-date-label {
            font-weight: 500;
            font-size: 9px;
            color: #667085;
        }

        .h-date {
            font-weight: 500;
            font-size: 12px;
            color: #344054;
            padding-left: 10px;
        }

        img {
            width: 292px;
            height: 61px;
        }

        .h-date {
            padding-bottom: 10px;
        }

        .body-content {
            width: 703px;
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 1px solid #D0D7DD;
            margin-top: 10px;
        }

        .body-content table {
            padding: 10px;
        }

        footer {
            position: fixed;
            bottom: -35px;
            left: 0;
            right: 0;
            height: 50px;
            text-align: center;
            line-height: 23px;
            font-size: 12px;
        }

        .page-number:before {
            content: "Page " counter(page);
        }

        .footer {
            width: 603px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            flex-direction: column;
            margin: 0 auto;
            color: #005981;
        }


        .custom-table {
            position: fixed;
            width: 684px;
            margin-top: 10px;
            border: 1px solid #D0D7DD;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 11px;
            bottom: 20px;
            color: #344054;
            padding: 8px 10px;
            height: 45px;
        }

        .cell-left {
            width: 468px;
            float: left;
        }

        .cell-right {
            width: 212px;
            text-align: center;
            float: right;
            border-left: 1px solid #D0D7DD;
            display: flex;
            flex-direction: row;
            padding: -20px;
        }

        .page-break-before {
            page-break-before: always;
        }

        .element-container {
            display: flex;
            flex-wrap: nowrap;
            padding: 12px;
            color: #344054;
            font-size: 11px;

        }

        .element-container p {
            margin-top: -10px;
            color: #344054;
        }

        .element-content {
            display: inline-flex;
            flex-direction: column;
            text-align: center;
            gap: 0;
            width: 65px;
        }

        .element-header, .element-body {
            height: 15px;
            border: 1px solid #D0D7DD;
            padding: 4px 0;
            margin-left: -3px;
            text-transform: capitalize;
        }

        .element-body {
            border-top: none;
            padding: 4px;
        }

        .element-header {
            background: #f2f4f7;
        }

        .table-bordered {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }

        .table-bordered th,
        .table-bordered td {
            padding: 8px; /* Adjust padding as needed */
            text-align: left;
            border: 1px solid #dee2e6;
            font-weight: normal;
        }

        .table-bordered thead th {
            background-color: #f8f9fa; /* Light grey for header */
            border-bottom: 2px solid #dee2e6;
        }

        .table-bordered tbody tr:nth-child(even) {
            background-color: #f2f2f2; /* Light grey for alternating rows */
        }

        .table-bordered tbody {
            color: #344054
        }

        .group-label {
            font-size: 11px;
            font-weight: 600;
            color: #344054;
        }

        .test-result {
            width: 100%;
            padding: 10px 0;
        }

        .test-result-table {
            width: 50%;
            float: left;
        }

        .impact-test-table {
            width: 100%;
            border-collapse: collapse;
        }

        .impact-test-table th {
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: center;
            color: #667085;
        }

        .impact-test-table td {
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: center;
            color: #344054;
        }
    </style>
</head>

<body>
<header>
    <center><img src="data:image/png;base64,{{ $pageBgImage }}" alt="Logo"></center>
    <div class="content">
        <table>
            <tr>
                <td class="label">{{ __('messages.hweQs.customer') }}</td>
                <td>:</td>
                <td class="value">
                    {{ collect([
                        $certificate->sample?->calculation?->offerPos?->offer?->customer?->name ?? '',
                        $certificate->sample?->calculation?->offerPos?->offer?->customer?->address ?? '',
                        $certificate->sample?->calculation?->offerPos?->offer?->customer?->postal_code ?? '',
                        $certificate->sample?->calculation?->offerPos?->offer?->customer?->city ?? ''
                    ])->filter()->join(', ') }}
                </td>
                <td class="label">{{ __('messages.hweQs.certificateNo') }}</td>
                <td>:</td>
                <td class="value">{{ $certificate?->sample?->prodOrder?->custom_id ?? '' }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.hweQs.factoryNo') }}</td>
                <td>:</td>
                <td class="value">{{ $certificate?->sample?->salesOrderPos?->salesOrders?->custom_id .'/'.$certificate?->sample?->salesOrderPos?->pos }}</td>
                <td class="label">{{ __('messages.hweQs.inspectionCertificate') }}</td>
                <td>:</td>
                <td class="value">{{ $certificate->sample?->calculation?->calculationTestingScope?->attestation ?__('messages.hwekalkOfferSummary.enums.'.$certificate->sample?->calculation?->calculationTestingScope?->attestation) :'' }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.hweQs.factoryNo2') }}</td>
                <td>:</td>
                <td class="value">{{ $certificate?->sample?->prodOrder?->custom_id ?? '' }}</td>
                <td class="label">{{ __('messages.hweQs.recipients') }}</td>
                <td>:</td>
                <td class="value">
                    @php
                        $attestationEntities = $certificate->sample?->calculation?->calculationTestingScope?->attestationEntities;

                        $adjustments = $attestationEntities?->pluck('attestation_entity')?->map(function ($value) {
                            return trans('messages.attestationEntity.' . $value);
                        })?->implode(', ') ?? '';
                        echo $adjustments;
                    @endphp
                </td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.hweQs.orderNo') }}</td>
                <td>:</td>
                <td class="value">{{ $certificate?->sample?->salesOrderPos?->salesOrders?->customer_reference }}</td>
                <td class="label">{{ __('messages.hweQs.testNo') }}</td>
                <td>:</td>
                <td class="value">{{$certificate->inspection_no}}</td>
            </tr>
              <tr>
                <td class="label">{{ __('messages.hweQs.Order_item') }}</td>
                <td>:</td>
                <td class="value">{{$certificate?->sample?->salesOrderPos?->customer_reference}}</td>
                 <td class="label">{{ __('messages.hweQs.sampleNo') }}</td>
                <td>:</td>
                <td class="value">{{ $hweCertificateHweQsSample?->hweQsSample?->custom_id ?? '' }}</td>
            </tr>
             <tr>
                <td class="label">{{ __('messages.hweQs.Customer_mat') }}</td>
                <td>:</td>
                <td class="value">XXXX</td>
                <td class="label">{{ __('messages.hweQs.orderSpecification') }}</td>
                <td>:</td>
                <td class="value">{{$certificate->sample?->calculation?->testingScope?->custom_id}}</td>
            </tr>
            <tr>
                <td class="label">{{__('messages.hweQs.Item_Name')}}</td>
                <td>:</td>
                <td class="value">{{$certificate?->sample?->calculation?->offerPos?->item_name}}</td>
                <td class="label">{{__('messages.hweQs.Quantity')}}</td>
                <td>:</td>
                <td class="value">{{$certificate?->sample?->quantity}}</td>
            </tr>
              <tr>
                <td class="label">{{__('messages.hweQs.Dimension')}}</td>
                <td>:</td>
                <td class="value">{{$certificate->sample?->calculation?->offerPos?->outer_diameter_final}} / {{$certificate->sample?->calculation?->offerPos?->inner_diameter_final}} x {{$certificate->sample?->calculation?->offerPos?->height_final}} mm</td>
                <td class="label">{{__('messages.hweQs.Heat_No')}}</td>
                <td>:</td>
                <td class="value">{{$bomPos?->melt?->value_string}}</td>
            </tr>
             <tr>
                <td class="label">{{__('messages.hweQs.Drawing_no')}}</td>
                <td>:</td>
                <td class="value">{{$certificate->sample?->calculation?->offerPos?->drawing_id}}</td>
                 <td class="label">{{ __('messages.hweQs.factory') }}</td>
                <td>:</td>
                <td class="value">Hammerwerk Erft</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.hweQs.material') }}</td>
                <td>:</td>
                <td class="value">{{ $certificate->sample?->calculation?->offerPos?->material?->custom_id . ' / ' . $certificate->sample?->calculation?->offerPos?->material?->name }}</td>
                <td class="label">{{ __('messages.hweQs.factorySymbol') }}</td>
                <td>:</td>
                <td class="value">
                    <img src="data:image/png;base64,{{ $pageSmallLogo }}" alt="Logo"
                         style="width: 12px; height: 12px">
                </td>
            </tr>
        </table>

    </div>
{{--    <span>--}}
{{--            <center><span class="h-date-label"></span>  <span--}}
{{--                        class="h-date"> </span></center>--}}
{{--        </span>--}}
    <br>
</header>
<footer class="footer">
    <span>Hammerwerk-Erft G.Diederichs GmbH & Co. KG . Ernst-Diederichs-Straße 1 . D-53902 Bad Münstereifel</span>
    <span>49 2253/311-0 . certificate@hammerwerk-erft.de . www.hammerwerk-erft.de</span>
</footer>
<main style="top: 205px; position: absolute">
    @if(isset($melt))
        <section class="body-content">
            <p class="group-label" style="margin-left:15px">{{__('messages.hweQs.Chemical_Analyses')}}</p>
            <table style="margin:-10px 0 0 -5px ">
                <tr>
                    <td class="label">{{ __('messages.hweQs.steelMakers') }}</td>
                    <td>:</td>
                    <td class="value">{{ $melt?->item?->hweClassificationLieferant?->value_string ?? '' }}</td>
                    <td class="label">{{__('messages.hweQs.Melting_Type')}}</td>
                    <td>:</td>
                    <td class="value">{{ $melt?->melting_type ?__('messages.hweMeltTypeEnum.'.$melt->melting_type) :'' }}</td>
                </tr>
                <tr>
                    <td class="label"></td>
                    <td></td>
                    <td class="value"></td>
                    <td class="label">{{__('messages.hweQs.Casting_Type')}}</td>
                    <td>:</td>

                    <td class="value">
                        @if ($melt?->item?->hweClassificationGiesstyp?->value_string == "B")
                            {{ __('messages.hweQs.Block_casting') }}
                        @elseif ($melt?->item?->hweClassificationGiesstyp[0]?->value_string == "S")
                            {{ __('messages.hweQs.Continuous_casting') }}
                        @endif
                    </td>
                </tr>
            </table>
            @if($certificate->is_show_chemical_analysis || $certificate->sample?->calculation?->calculationDocumentation?->product_analysis)
                @if($certificate->is_show_chemical_analysis && $certificate->sample?->calculation?->calculationDocumentation?->product_analysis)
                    <div class="element-container">
                        @foreach($elements as $element)
                            @if(isset($melt) && ($melt["element_{$element}_hwe"]))
                                <div class="element-content">
                                    <div class="element-header">
                                        {{ $element }}
                                    </div>
                                    <div class="element-body">
                                        {{ $melt["element_{$element}_hwe"]}}{{ $element == 'b' ? 'ppm' : '%' }}
                                    </div>
                                </div>
                            @endif
                        @endforeach

                        @if($melt->element_c_hwe || $melt->element_n_hwe)
                            <div class="element-content">
                                <div class="element-header">
                                    C+N
                                </div>
                                <div class="element-body">
                                    {{ ($melt->element_c_hwe ?? 0) + ($melt->element_n_hwe ?? 0) }}%
                                </div>
                            </div>
                        @endif
                        @if($melt->element_nb_hwe || $melt->element_ti_hwe || $melt->element_v_hwe)
                            <div class="element-content">
                                <div class="element-header">
                                    Nb+Ti+V
                                </div>
                                <div class="element-body">
                                    {{ ($melt->element_nb_hwe ?? 0) + ($melt->element_ti_hwe ?? 0) + ($melt->element_v_hwe ?? 0) }}
                                    %
                                </div>
                            </div>
                        @endif
                        @if($melt->element_cu_hwe || $melt->element_n_hwe)
                            <div class="element-content">
                                <div class="element-header">
                                    Cu+10+N
                                </div>
                                <div class="element-body">
                                    {{ ($melt->element_cu_hwe ?? 0) + 10 + ($melt->element_n_hwe ?? 0) }}%
                                </div>
                            </div>
                        @endif
                        @php
                            $ceq = ($melt->element_c_hwe ?? 0) +
                                        (($melt->element_mn_hwe  ?? 0) / 6) +
                                        (($melt->element_cr_hwe  ?? 0) +
                                         ($melt->element_mo_hwe  ?? 0) +
                                         ($melt->element_v_hwe  ?? 0)) / 5 +
                                        (($melt->element_ni_hwe  ?? 0) +
                                         ($melt->element_cu_hwe  ?? 0)) / 15;
                        @endphp
                        @if($ceq)
                            <div class="element-content">
                                <div class="element-header">
                                    CEQ
                                </div>
                                <div class="element-body">
                                    {{  number_format($ceq, 5)}}%
                                </div>
                            </div>
                        @endif
                    </div>
                @elseif($certificate->is_show_chemical_analysis)
                    <div class="element-container">

                        @foreach($elements as $element)
                            @if(isset($melt) && ($melt["element_{$element}"]))
                                <div class="element-content">
                                    <div class="element-header">
                                        {{ $element }}
                                    </div>
                                    <div class="element-body">
                                        {{  $melt["element_{$element}"] }}{{ $element == 'b' ? 'ppm' : '%' }}
                                    </div>
                                </div>
                            @endif
                        @endforeach


                        @if($melt->element_c || $melt->element_n)
                            <div class="element-content">
                                <div class="element-header">
                                    C+N
                                </div>
                                <div class="element-body">
                                    {{ ($melt->element_c ?? 0) + ($melt->element_n ?? 0) }}%
                                </div>
                            </div>
                        @endif


                        @if($melt->element_nb || $melt->element_ti || $melt->element_v)
                            <div class="element-content">
                                <div class="element-header">
                                    Nb+Ti+V
                                </div>
                                <div class="element-body">
                                    {{ ($melt->element_nb ?? 0) + ($melt->element_ti ?? 0) + ($melt->element_v ?? 0) }}
                                    %
                                </div>
                            </div>
                        @endif


                        @if($melt->element_cu || $melt->element_n)
                            <div class="element-content">
                                <div class="element-header">
                                    Cu+10+N
                                </div>
                                <div class="element-body">
                                    {{ ($melt->element_cu ?? 0) + 10 + ($melt->element_n ?? 0) }}%
                                </div>
                            </div>
                        @endif
                        @php
                            $ceq = ( $melt->element_c ?? 0) +
                                        ( ($melt->element_mn ?? 0) / 6) +
                                        (( $melt->element_cr ?? 0) +
                                         ( $melt->element_mo ?? 0) +
                                         ( $melt->element_v ?? 0)) / 5 +
                                        (( $melt->element_ni ?? 0) +
                                         ( $melt->element_cu ?? 0)) / 15;
                        @endphp
                        @if($ceq)
                            <div class="element-content">
                                <div class="element-header">
                                    CEQ
                                </div>
                                <div class="element-body">
                                    {{  number_format($ceq, 5)}}%
                                </div>
                            </div>
                        @endif
                    </div>
                @endif
            @endif

        </section>
        @if($certificate?->is_show_grain_size_determination || $certificate?->sample?->calculation?->calculationDocumentation?->grainsize_of_the_component)
            <section class="body-content">

                <div class="element-container">
                    <p class="group-label">{{ __("messages.hweQs.grainSizeDetermination") }}</p>
                    @if($certificate?->is_show_grain_size_determination && $certificate->sample?->calculation?->calculationDocumentation?->grainsize_of_the_component)
                        <table style="margin-left: -15px">
                           <tr>
                               <td class="label">{{ __('messages.grain_size_test.test_specification') }}</td>
                               <td>:</td>
                               <td class="value">{{ $hweQsGrainSize?->grain_size_specification ? __('messages.grain_size_test.'.$hweQsGrainSize?->grain_size_specification) : '' }}</td>
                               <td class="label">{{__('messages.grain_size_test.procedure')}}</td>
                               <td>:</td>
                               <td class="value">{{ $hweQsGrainSize?->grain_size_procedure ? __('messages.grain_size_test.'.$hweQsGrainSize?->grain_size_procedure) : '' }}</td>
                           </tr>
                           <tr>
                               <td class="label">{{ __('messages.grain_size_test.testing_scope') }}</td>
                               <td>:</td>
                               <td class="value">{{ $hweQsGrainSize?->grain_size_testing_scope ? __('messages.grain_size_test.'.$hweQsGrainSize?->grain_size_testing_scope) : '' }}</td>
                               <td class="label">{{ __("messages.hweQs.grainSize") }}</td>
                               <td>:</td>
                               <td class="value">{{ $hweQsGrainSize?->grain_size_testing_operator ? __('messages.grain_size_test.'.$hweQsGrainSize?->grain_size_testing_operator) : '' }} {{$hweQsGrainSize->value}}</td>
                           </tr>
                       </table>

                    @elseif($certificate?->is_show_grain_size_determination)

                        <table style="margin-left: -15px">
                                <tr>
                                    <td class="label">{{ __('messages.grain_size_test.test_specification') }}</td>
                                    <td>:</td>
                                    <td class="value">{{ $melt?->grain_size_specification ? __('messages.grain_size_test.'.$melt?->grain_size_specification) : '' }}</td>
                                    <td class="label">{{__('messages.grain_size_test.procedure')}}</td>
                                    <td>:</td>
                                    <td class="value">{{ $hweQsGrainSize?->grain_size_procedure ? __('messages.grain_size_test.'.$melt?->grain_size_procedure) : '' }}</td>
                                </tr>
                                <tr>
                                    <td class="label">{{ __('messages.grain_size_test.testing_scope') }}</td>
                                    <td>:</td>
                                    <td class="value">{{ $melt?->grain_size_testing_scope ? __('messages.grain_size_test.'.$melt?->grain_size_testing_scope) : '' }}</td>
                                    <td class="label">{{{ __("messages.hweQs.grainSize") }}}</td>
                                    <td>:</td>
                                    <td class="value">{{ __("messages.hweQs.grainSize") }} {{ $melt?->grain_size_testing_operator_hwe == 'GREATER_EQUAL' ? '>=' : '<' }} {{ $melt?->grain_size_value_hwe }}</td>
                                </tr>
                            </table>
                    @endif
                </div>

            </section>
        @endif
        @if($certificate->is_show_purity_determination || $certificate->sample?->calculation?->calculationDocumentation?->cleanliness_of_the_component)
            <section class="body-content">

                <div class="element-container" style="margin-top: 5px">
                    @if($certificate?->is_show_purity_determination && $certificate->sample?->calculation?->calculationDocumentation?->cleanliness_of_the_component)
                        <p class="group-label">{{__('messages.hweQs.Purity_Determination')}}</p>

                        <table style="margin-top: -10px;margin-left: -20px">
                                <tr>
                                    <td class="label">{{ __('messages.hweQs.purityGradeK3Max') }}</td>
                                    <td>:</td>
                                    <td class="value">{{  $hweQsCleanlinessTest?->k3 ?? '' }}</td>
                                    <td class="label">{{ __('messages.hweQs.purityGradeK4Max') }}</td>
                                    <td>:</td>
                                    <td class="value">{{ $hweQsCleanlinessTest?->k4 ?? '' }}</td>
                                </tr>
                            </table>
                        <br>
                        <div class="element-content" style="margin-top: -15px; min-width: 130px;max-width: 60px">
                            <div class="element-header">

                            </div>
                            <div class="element-body">
                                {{__('messages.hweQs.Fine')}}
                            </div>

                            <div class="element-body">
                                {{__('messages.hweQs.Glob')}}
                            </div>
                        </div>
                        @foreach($purities as $purity)

                            <div class="element-content">
                                <div class="element-header">
                                    {{ $purity }}
                                </div>
                                @if($purity!=='ds')
                                    <div class="element-body">
                                        {{ $hweQsCleanlinessTest["fine_{$purity}"]?? ''  }}
                                    </div>
                                @else
                                    <div class="element-content">
                                        <div class="element-body">
                                            {{ $hweQsCleanlinessTest["{$purity}"] ?? '' }}
                                        </div>
                                    </div>
                                @endif


                                <div class="element-body">
                                    {{  $hweQsCleanlinessTest["thick_{$purity}"] ?? '' }}
                                </div>
                            </div>

                        @endforeach
                    @elseif($certificate->is_show_purity_determination)
                        <p class="group-label">{{__('messages.hweQs.Purity_Determination')}}</p>
                        @if($melt->k3_hwe || $melt->k4_hwe)
                            <table style="margin-top: -10px;margin-left: -20px">
                                <tr>
                                    <td class="label">{{ __('messages.hweQs.purityGradeK3Max') }}</td>
                                    <td>:</td>
                                    <td class="value">{{ $melt->k3_hwe ?? '' }}</td>
                                    <td class="label">{{ __('messages.hweQs.purityGradeK4Max') }}</td>
                                    <td>:</td>
                                    <td class="value">{{ $melt->k4_hwe ??  '' }}</td>
                                </tr>
                            </table>
                        @endif
                        <br>
                        <div class="element-content" style="margin-top: -15px; min-width: 130px;max-width: 60px">
                            <div class="element-header">

                            </div>
                            <div class="element-body">
                                {{__('messages.hweQs.Fine')}}
                            </div>

                            <div class="element-body">
                                {{__('messages.hweQs.Glob')}}
                            </div>
                        </div>
                        @foreach($purities as $purity)

                            <div class="element-content">
                                <div class="element-header">
                                    {{ $purity }}
                                </div>
                                @if($purity!=='ds')
                                    <div class="element-body">
                                        {{ $melt["fine_{$purity}_hwe"]  ?? '' }}
                                    </div>
                                @else
                                    <div class="element-content">
                                        <div class="element-body">
                                            {{ $melt["{$purity}_hwe"]  }}
                                        </div>
                                    </div>
                                @endif


                                <div class="element-body">
                                    {{ $melt["thick_{$purity}_hwe"] ?? '' }}
                                </div>
                            </div>

                        @endforeach
                    @endif
                </div>

            </section>
        @endif
        @if($certificate->is_show_jominy_test || $certificate->sample?->calculation?->calculationDocumentation?->jominy)
            <section class="body-content">
                @if($certificate->is_show_jominy_test && $certificate->sample?->calculation?->calculationDocumentation?->jominy)
                    <div class="element-container " style="margin-top: 5px">
                        <p style="padding: 3px 0 3px 0" class="group-label">Jominy Order</p>

                        @if($setJominyVariant)
{{--                            <p>HRC--}}
{{--                                - {{ $hweQsJominy->variant ? __('messages.hweQs.' . $hweQsJominy->variant) : '' }}</p>--}}
{{--                            <br>--}}
                            @php
                                $iteration = 0;
                            @endphp
                            <div class="element-content">
                                <div class="element-header" style=" text-transform: lowercase;">
                                    mm
                                </div>
                                <div class="element-body">
                                    HRC
                                </div>
                            </div>
                            @foreach($variants as $key=>$variant)
                                @if(($hweQsJominy["value_{$variant}"]) && in_array($variant, $setJominyVariant))
                                    @if($iteration===9)
                                        <div class="element-content">
                                            <div class="element-header" style=" text-transform: lowercase;">
                                                mm
                                            </div>
                                            <div class="element-body">
                                                HRC
                                            </div>
                                        </div>
                                        @php
                                            $iteration++;
                                        @endphp
                                    @endif
                                    <div class="element-content">
                                        <div class="element-header">
                                            {{ $variant =='1_5' ? __('messages.hweQs.1_5') : $variant}}
                                        </div>
                                        <div class="element-body">
                                            {{ $hweQsJominy["value_{$variant}"] }}
                                        </div>
                                    </div>
                                    @php
                                        $iteration++;
                                    @endphp
                                @endif
                            @endforeach
                        @endif
                    </div>

                @elseif($certificate->is_show_jominy_test)
                    <div class="element-container " style="margin-top: 5px">
                    <p style="padding: 3px 0 3px 0" class="group-label">Jominy</p>

                        @if($setVariant)
{{--                            <p>HRC - {{ $melt->variant ? __('messages.hweQs.' . $melt->variant) : '' }}</p>--}}
{{--                            <br>--}}
                            @php
                                $iteration = 0;
                            @endphp
                            <div class="element-content">
                            <div class="element-header" style=" text-transform: lowercase;">
                                mm
                            </div>
                            <div class="element-body">
                                HRC
                            </div>
                        </div>
                            @foreach($variants as $key=>$variant)
                                @if(($melt["j_{$variant}_sw"]) && in_array($variant, $setVariant))
                                    @if($iteration===9)
                                        <div class="element-content">
                                        <div class="element-header" style=" text-transform: lowercase;">
                                            mm
                                        </div>
                                        <div class="element-body">
                                            HRC
                                        </div>
                                    </div>
                                        @php
                                            $iteration++;
                                        @endphp
                                    @endif
                                    <div class="element-content">
                                    <div class="element-header">
                                        {{ $variant =='1_5' ? __('messages.hweQs.1_5') : $variant}}
                                    </div>
                                    <div class="element-body">
                                        {{  $melt["j_{$variant}_sw"] ?? '' }}
                                    </div>
                                </div>
                                    @php
                                        $iteration++;
                                    @endphp
                                @endif
                            @endforeach
                        @endif
                </div>

                @endif

            </section>
        @endif
    @endif

    {{--    test result --}}

    @include('hwe-qs.test-result', compact('certificate','hweQsTensileTest','hweQsImpactTest'))

    @if($certificate->prod_order_pos_id_ultrasonic)
        @include('hwe-qs.ultrasonic', compact('certificate', 'user','hweQsUs'))
    @endif

    {{--   surface track      --}}
    @if($certificate->prod_order_pos_id_surface)
        @include('hwe-qs.surface-track', compact('certificate', 'hweQsMt',  'hweQsPt', 'hweQsVt'))
    @endif
    {{--        surface track--}}

    @include('hwe-qs.last-page',compact('certificate','identIsOk'))
    <div class="custom-table">
        <div class="cell-left">
            <br>
            <span class="content-text">
                    Es wird bestätigt, dass die Lieferung den Vereinbarungen bei der Bestellung entspricht<br>
                    {{now()->format('d.m.Y')}}
               </span>
        </div>
        <div class="cell-right">
            <br>
            <span style="border-bottom: 1px solid #D0D7DD; width: 90%; display: inline-block;">&nbsp;</span>

            <br>
            <span class="signature-text">Abnahmebeauftragte</span>
        </div>
    </div>
</main>
<script type="text/php">
    if(isset($pdf)) {
        $pdf->page_script('
            $x = 300;
            $y = 8;
            $font = $fontMetrics->get_font("Arial, Helvetica, sans-serif", 100);
            $size = 9;
            $color = array(0,0,0,.5);
            $word_space = 0.0;
            $char_space = 0.0;
            $angle = 0.0;
            if ($PAGE_COUNT > 1) {
                $text = "{{ $pageSettings['footer_page_text'] }} {PAGE_NUM} / {PAGE_COUNT}";
                $pdf->page_text($x, $y, $text, $font, $size, $color, $word_space, $char_space, $angle);
            }
        ');
        $pdf->page_script('
            $x = 440;
            $y = 8;
            $font = $fontMetrics->get_font("Arial, Helvetica, sans-serif", 100);
            $size = 9;
            $color = array(0,0,0,.5);
            $word_space = 0.0;
            $char_space = 0.0;
            $angle = 0.0;
            if ($PAGE_COUNT > 1) {
                $text = "{{ __('messages.hweQs.header_date_label') }} {{now()->format('d M, Y')}}";
                $pdf->page_text($x, $y, $text, $font, $size, $color, $word_space, $char_space, $angle);
            }
        ');
    }
</script>
</body>

</html>
