@section('custom-header')
@endsection

@section('custom-footer')
    <table style="width: 600px; height: 20px;z-index: 9999; margin-top: 10px;">
        <tbody>
            <tr style="font-size: 10px; color: rgb(0,0,0,0.7);">
                <th style="width: 100px;">{{ $pageSettings['current_time'] }}</th>
            </tr>
        </tbody>
    </table>
@endsection

@section('content')
<div class="offer-main-container" style="margin: 0; width: 100vw; height: 90vh; top: 80px;">
    <!-- Offer and Offer Pos Details -->
    <div class="summary-section">
        <table class="table table-bordered table-striped" style="border: 1px solid black;">
            <thead>
                <tr>
                    <th colspan="4" style="color: white; padding: 5px; font-size: 18px; border: 1px solid black;background-color: #005981;text-align: right;">{{ __('messages.hwekalkOfferSummary.mainContent.date') }}: {{ $pageSettings['current_date'] }}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.offer') }} {{ __('messages.hwekalkOfferSummary.mainContent.num') }} Rev. + {{ __('messages.hwekalkOfferSummary.mainContent.pos') }}</strong></td>
                    @if($viewData['offer'])
                        <td style="padding: 5px; border: 1px solid black;">{{ $viewData['offer']['custom_id'] }} Rev. {{ $viewData['offer']['version'] }} {{ __('messages.hwekalkOfferSummary.mainContent.pos') }} {{ $viewData['pos'] }}</td>
                    @else
                        <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.pos') }} {{ $viewData['pos'] }}</td>
                    @endif
                    <td style="padding: 5px; border: 1px solid black;"><strong>KAUF / {{ __('messages.hwekalkOfferSummary.mainContent.pos') }}</strong></td>
                    @if($viewData['calculation'])
                        <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation']['sales_order'] }} {{ $viewData['calculation']['sales_order_pos'] ? __('messages.hwekalkOfferSummary.mainContent.pos') : '' }} {{ $viewData['calculation']['sales_order_pos'] }}</td>
                    @else
                        <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.pos') }}</td>
                    @endif
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.customer') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['offer'] && $viewData['offer']['customer'] ? $viewData['offer']['customer']['name'] : '' }}</td>
                    <td colspan="2"></td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.quantity') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['quantity'] }}</td>
                    <td colspan="2" style="padding: 5px; border: 1px solid black;"></td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>DLZ [{{ __('messages.hwekalkOfferSummary.mainContent.days') }}]</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['cost_lead_days_sum'] }}</td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.delivery_time') }} [{{ __('messages.hwekalkOfferSummary.mainContent.inWeeks') }}]</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] ? $viewData['calculation']['delivery_interval'] : '' }}</td>
                </tr>
                <!-- <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.cost') }} / {{ __('messages.hwekalkOfferSummary.mainContent.piece_pc') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">xxxxxxxx</td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.offer_price') }} / {{ __('messages.hwekalkOfferSummary.mainContent.piece_pc') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">xxxxxxxx</td>
                </tr> -->
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.designation') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{$viewData['item_name'] }}</td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.product_type') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['product_type'] && $viewData['product_type'] != '' ? __('messages.hwekalkOfferSummary.enums.'.$viewData['product_type']) : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>Kd. Mat. {{ __('messages.hwekalkOfferSummary.mainContent.num') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['customer_material_number'] }}</td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>Zg. {{ __('messages.hwekalkOfferSummary.mainContent.num') }}/Rev.</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['drawing_id'] }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.delivery') }} {{ __('messages.hwekalkOfferSummary.mainContent.condition') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['delivery_state'] }}</td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.delivery_weight') }} / {{ __('messages.hwekalkOfferSummary.mainContent.piece_pc') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] ? $viewData['calculation']['delivery_weight'] : 0 }} Kg</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.material') }}</strong></td>
                    @if($viewData['material'])
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['material']['custom_id'] }}, {{ $viewData['material']['name'] }}</td>
                    @else 
                    <td style="padding: 5px; border: 1px solid black;"></td>
                    @endif
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.basisMaterial') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['item'] ? $viewData['item']['name'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.in_stock') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['is_rejected'] == 1 ? __('messages.hwekalkOfferSummary.mainContent.yes') : __('messages.hwekalkOfferSummary.mainContent.no') }}</td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.reasonForRefusal') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['rejection_type'] && $viewData['rejection_type'] != '' ? __('messages.hwekalkOfferSummary.enums.'.$viewData['rejection_type']) : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.customer_dimensions') }}</strong></td>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] ? $viewData['calculation']['text_final_dimension'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.approx') }} {{ __('messages.hwekalkOfferSummary.mainContent.raw_dimension') }}</strong></td>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] ? $viewData['calculation']['text_raw_dimension'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.heat') }}{{ __('messages.hwekalkOfferSummary.mainContent.treatment') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] ? $viewData['calculation']['heat_treatment_types'] : ''}}</td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.addition_measure') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] ? $viewData['calculation']['additional_heat_treatment_types'] : ''}}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.remark') }} {{ __('messages.hwekalkOfferSummary.mainContent.execution') }}</strong></td>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] ? $viewData['calculation']['specification_note'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.restrictions') }} BW</strong></td>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] ? $viewData['calculation']['note_machining'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.internal') }} {{ __('messages.hwekalkOfferSummary.mainContent.information') }}</strong></td>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] ? $viewData['calculation']['internal_note'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.cut_allowence') }}</strong></td>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;">{{ $viewData['outer_dim_cut_allow'] ? $viewData['outer_dim_cut_allow'] . ' mm' : '' }}</td>
                </tr>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.tolerance') }}</strong></td>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;">{{ $viewData['outer_dim_tol'] }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.surface_quality') }}</strong></td>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;">{{ $viewData['outer_dim_surface'] }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.tensile') }} {{ __('messages.hwekalkOfferSummary.mainContent.strength') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{!! $viewData['calculation'] && $viewData['calculation']['strength_span'] ? $viewData['calculation']['strength_span'] . ' N/mm<sup>2</sup>' : '' !!}</td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.hardness') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['hardness'] ? $viewData['calculation']['hardness'] . ' HB' : ''}}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.total_deformation') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['deformation'] && isset($viewData['calculation']['deformation']['deformation']) ? 'Verformung mind.' . $viewData['calculation']['deformation']['deformation'] : ''}}</td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>US EFG Max.</strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['calculation_non_destructive_testing'] && $viewData['calculation']['calculation_non_destructive_testing']['ultrasound_efg_max'] ? $viewData['calculation']['calculation_non_destructive_testing']['ultrasound_efg_max'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.selectionOf') }} {{ __('messages.hwekalkOfferSummary.mainContent.individual') }} {{ __('messages.hwekalkOfferSummary.mainContent.assessment') }}</strong></td>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;">{!! nl2br(e($viewData['text_certificate'])) !!}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="assessment-section" style="page-break-before: always;">
        <table class="table table-bordered table-striped" style="border: 1px solid black;page-break-inside: auto;">
            <thead>
                <tr>
                    <th colspan="3" style="color: white; padding: 5px; font-size: 16px; border: 1px solid black;background-color: #005981">{{ __('messages.hwekalkOfferSummary.mainContent.technical') }} {{ __('messages.hwekalkOfferSummary.mainContent.assessment') }}</th>
                    <!-- <th colspan="2" style="color: white; padding: 5px; font-size: 14px; text-align: center; border: 1px solid black;background-color: #005981">{{ __('messages.hwekalkOfferSummary.mainContent.offerRelevant') }} {{ __('messages.hwekalkOfferSummary.mainContent.summaryOfTheAssessment') }} ({{ __('messages.hwekalkOfferSummary.mainContent.asForTheOffer') }})</th> -->
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.specification') }}</strong></td>
                    @if($viewData['calculation'] && $viewData['calculation']['specification'] && $viewData['calculation']['specification'] != [])
                        <?php $text = $viewData['calculation']['specification']['custom_id'] ?? '';
                            if($text != '' && $viewData['calculation']['specification']['name']) {
                                $text .= ' / ' . $viewData['calculation']['specification']['name'];
                            } else {
                                $text .= $viewData['calculation']['specification']['name'];
                            }
                        ?> 
                        <td colspan="2" style="padding: 5px; border: 1px solid black;">{{ $text }}</td>
                    @else
                        <td colspan="2" style="padding: 5px; border: 1px solid black;"></td>
                    @endif
                </tr>
                <tr>
                    <td colspan="3" style="padding: 5px; border: 1px solid black;color: red;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.warning_message') }}</strong></td>
                </tr>
                <!-- Start DOCUMENT -->
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.specification') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>ID / {{ __('messages.hwekalkOfferSummary.mainContent.name') }}: </strong></td>
                    @if($viewData['calculation'] && $viewData['calculation']['documentation'] && $viewData['calculation']['documentation'] != [])
                        <?php $text = $viewData['calculation']['standard_documentation'] ? $viewData['calculation']['standard_documentation']['custom_id'] : '';
                            if($text != '' && $viewData['calculation']['documentation']['name']) {
                                $text .=  ' / ' . $viewData['calculation']['documentation']['name'];
                            } else {
                                $text .=  $viewData['calculation']['documentation']['name'];
                            }
                        ?>
                        <td style="padding: 5px; border: 1px solid black;">{{ $text }}</td>
                    @else
                        <td style="padding: 5px; border: 1px solid black;"></td>
                    @endif
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"></td>
                    <td style="padding: 5px; border: 1px solid black;">FPP {{ __('messages.hwekalkOfferSummary.mainContent.no') }} / FPP Rev.: </td>
                    @if($viewData['calculation'] && $viewData['calculation']['documentation'] && $viewData['calculation']['documentation'] != [])
                        <?php $text =  $viewData['calculation']['documentation']['fpp_nr']; 
                            if($text != '' && $viewData['calculation']['documentation']['fpp_rev']) {
                                $text .= ' / ' . $viewData['calculation']['documentation']['fpp_rev'];
                            } else {
                                $text .= $viewData['calculation']['documentation']['fpp_rev'];
                            }
                        ?>
                        <td style="padding: 5px; border: 1px solid black;">{{ $text }}</td>
                    @else 
                        <td style="padding: 5px; border: 1px solid black;"></td>
                    @endif
                </tr>
                <!-- Start MATERIAL CHEMICAL ANALYSIS -->
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.chem_analysis') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>DIN-Norm: </strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['material_analysis'] && $viewData['calculation']['material_analysis'] != [] && $viewData['calculation']['standard_material_analysis'] ? $viewData['calculation']['standard_material_analysis']['custom_id'] : '' }}</td>
                </tr>
                <tr>
                    <td rowspan="2" style="padding: 5px; border: 1px solid black;"></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.regulation_issue') }}</td>
                    @if($viewData['calculation'] && $viewData['calculation']['material_analysis'] && $viewData['calculation']['material_analysis'] != [])
                        <?php $text = $viewData['calculation']['material_analysis']['regulation'];
                            if($text != '' && $viewData['calculation']['material_analysis']['issue_revision']) {
                                $text .= ' + ' . $viewData['calculation']['material_analysis']['issue_revision'];
                            } else {
                                $text .= $viewData['calculation']['material_analysis']['issue_revision'];
                            }
                        ?> 
                        <td style="padding: 5px; border: 1px solid black;">{{ $text}}</td>
                    @else
                        <td style="padding: 5px; border: 1px solid black;"></td>
                    @endif
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.note') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['material_analysis'] && $viewData['calculation']['material_analysis'] != [] && $viewData['calculation']['material_analysis']['note'] ? $viewData['calculation']['material_analysis']['note']  : ''}}</td>
                </tr>
                <!-- Start HARDENABILITY RANGES -->
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.hardenability_range') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>DIN-Norm: </strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['hardenability_range'] && $viewData['calculation']['hardenability_range'] != [] && $viewData['calculation']['standard_hardenability_range'] ? $viewData['calculation']['standard_hardenability_range']['custom_id'] : '' }}</td>
                </tr>
                <tr>
                    <td rowspan="3" style="padding: 5px; border: 1px solid black;"></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.with_applicable_standard') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['hardenability_range'] && $viewData['calculation']['hardenability_range'] != [] && $viewData['calculation']['hardenability_range']['with_applicable_standard'] ? $viewData['calculation']['hardenability_range']['with_applicable_standard'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.hardening_tape') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['hardenability_range'] && $viewData['calculation']['hardenability_range'] != [] && $viewData['calculation']['hardenability_range']['jominy_batch'] ? $viewData['calculation']['hardenability_range']['jominy_batch'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.note') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['hardenability_range'] && $viewData['calculation']['hardenability_range'] != [] && $viewData['calculation']['hardenability_range']['note'] ? $viewData['calculation']['hardenability_range']['note'] : '' }}</td>
                </tr>
                <!-- Start DEFORMATION -->
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.deformation') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.name') }}: </strong></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['deformation'] && $viewData['calculation']['deformation'] != [] && $viewData['calculation']['deformation']['custom_id'] ? $viewData['calculation']['deformation']['custom_id'] : '' }}</td>
                </tr>
                <tr>
                    <td rowspan="5" style="padding: 5px; border: 1px solid black;"></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.deformation') }}: </td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['deformation'] && $viewData['calculation']['deformation'] != [] && $viewData['calculation']['deformation']['deformation'] ? $viewData['calculation']['deformation']['deformation'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.stretch_forging_degree') }}: </td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['deformation'] && $viewData['calculation']['deformation'] != [] && $viewData['calculation']['deformation']['stretch_forging_degree'] && $viewData['calculation']['deformation']['stretch_forging_degree'] != '' ? __('messages.hwekalkOfferSummary.enums.deformation_stretch.' . $viewData['calculation']['deformation']['stretch_forging_degree']) : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.ingot_casting') }}: </td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['deformation'] && $viewData['calculation']['deformation'] != [] && $viewData['calculation']['deformation']['ingot_casting'] && $viewData['calculation']['deformation']['ingot_casting'] != '' ? __('messages.hwekalkOfferSummary.enums.deformation_cast.' . $viewData['calculation']['deformation']['ingot_casting']) : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.continues_casting') }}: </td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['deformation'] && $viewData['calculation']['deformation'] != [] && $viewData['calculation']['deformation']['continuous_casting'] && $viewData['calculation']['deformation']['continuous_casting'] != '' ? __('messages.hwekalkOfferSummary.enums.deformation_cast.' .  $viewData['calculation']['deformation']['continuous_casting']) : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.note') }}: </td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['deformation'] && $viewData['calculation']['deformation'] != [] && $viewData['calculation']['deformation']['note'] ? $viewData['calculation']['deformation']['note'] : '' }}</td>
                </tr>
                <!-- Start METALOGRAPHICS -->
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.metallographic') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>ID / {{ __('messages.hwekalkOfferSummary.mainContent.name') }}: </strong></td>
                    @if($viewData['calculation'] && $viewData['calculation']['metallography'] && $viewData['calculation']['metallography'] != [])
                        <?php $text = $viewData['calculation']['standard_metallography'] ? $viewData['calculation']['standard_metallography']['custom_id'] : '';
                            if($text != '' && $viewData['calculation']['metallography']['name']) {
                                $text .= ' / ' . $viewData['calculation']['metallography']['name'];
                            } else {
                                $text .= $viewData['calculation']['metallography']['name'];
                            }
                        ?>
                        <td style="padding: 5px; border: 1px solid black;">{{ $text }}</td>
                    @else
                        <td style="padding: 5px; border: 1px solid black;"></td>
                    @endif
                </tr>
                <tr>
                    <td rowspan="3" style="width: 150px;padding: 5px; border: 1px solid black;"></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.cleanliness_number') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['metallography'] && $viewData['calculation']['metallography'] != [] && $viewData['calculation']['metallography']['cleanliness_50602_astma45_sep1570'] ? $viewData['calculation']['metallography']['cleanliness_50602_astma45_sep1570'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.cleanliness_max') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['metallography'] && $viewData['calculation']['metallography'] != [] && $viewData['calculation']['metallography']['cleanliness_max_value'] ? $viewData['calculation']['metallography']['cleanliness_max_value'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.grain_size_fine') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['metallography'] && $viewData['calculation']['metallography'] != [] && $viewData['calculation']['metallography']['grain_size_value'] ? $viewData['calculation']['metallography']['grain_size_value'] : '' }}</td>
                </tr>
                <!-- Start TESTING SCOPE -->
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.testing_scope') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>ID / {{ __('messages.hwekalkOfferSummary.mainContent.name') }} : </strong></td>
                    @if($viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [])
                        <?php $text = $viewData['calculation']['standard_testing_scope'] ? $viewData['calculation']['standard_testing_scope']['custom_id'] : '';
                            if($text != '' && $viewData['calculation']['testing_scope']['name']) {
                                $text .= ' / ' . $viewData['calculation']['testing_scope']['name'];
                            } else {
                                $text .= $viewData['calculation']['testing_scope']['name'];
                            }
                        ?>
                        <td style="padding: 5px; border: 1px solid black;">{{ $text }}</td>
                    @else
                        <td style="padding: 5px; border: 1px solid black;"></td>
                    @endif
                </tr>
                <tr>
                    <td rowspan="10" style="padding: 5px; border: 1px solid black;"></td>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.attestation') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['attestation']) && $viewData['calculation']['testing_scope']['attestation'] != '' ? __('messages.hwekalkOfferSummary.enums.' . $viewData['calculation']['testing_scope']['attestation']): '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.attestation') }} {{ __('messages.hwekalkOfferSummary.mainContent.entity') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['attestation_entities']) && $viewData['calculation']['testing_scope']['attestation_entities'] != [] ? $viewData['calculation']['testing_scope']['attestation_entities_array'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.frequency') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['frequency']) && $viewData['calculation']['testing_scope']['frequency'] != '' ? __('messages.hwekalkOfferSummary.enums.' . $viewData['calculation']['testing_scope']['frequency']) : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.specimen_material') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['specimen_material']) && $viewData['calculation']['testing_scope']['specimen_material'] != '' ? __('messages.specimenMaterial.' . $viewData['calculation']['testing_scope']['specimen_material']) : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.specimen_allowance') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['specimen_allowance']) && $viewData['calculation']['testing_scope']['specimen_allowance'] != '' ? $viewData['calculation']['testing_scope']['specimen_allowance'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.qty_pieces_testing') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['quantity_testing_pieces']) && $viewData['calculation']['testing_scope']['quantity_testing_pieces'] != '' ? $viewData['calculation']['testing_scope']['quantity_testing_pieces'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">ME {{ __('messages.hwekalkOfferSummary.mainContent.quality') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['me_quality']) && $viewData['calculation']['testing_scope']['me_quality'] != '' ? __('messages.hwekalkOfferSummary.enums.' . $viewData['calculation']['testing_scope']['me_quality']) : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">MQ {{ __('messages.hwekalkOfferSummary.mainContent.quality') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['mq_quality']) && $viewData['calculation']['testing_scope']['mq_quality'] != '' ? __('messages.hwekalkOfferSummary.enums.' . $viewData['calculation']['testing_scope']['mq_quality']) : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.melting_type') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['melting_types']) && $viewData['calculation']['testing_scope']['melting_types'] != [] ? $viewData['calculation']['testing_scope']['melting_type_array'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">{{ __('messages.hwekalkOfferSummary.mainContent.classified_bies') }}</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['testing_scope'] && $viewData['calculation']['testing_scope'] != [] && isset($viewData['calculation']['testing_scope']['classified_bies']) && $viewData['calculation']['testing_scope']['classified_bies'] != [] ? $viewData['calculation']['testing_scope']['classified_bies_array'] : '' }}</td>
                </tr>
                <!-- Start NON DESTRUCTIVE TESTING -->
                <tr style="page-break-before: always;">
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.nonDestructive') }} {{ __('messages.hwekalkOfferSummary.mainContent.testing') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>ID / {{ __('messages.hwekalkOfferSummary.mainContent.name') }} : </strong></td>
                    @if($viewData['calculation'] && $viewData['calculation']['non_destructive_testing'] && $viewData['calculation']['non_destructive_testing'] != [])
                        <?php $text = $viewData['calculation']['standard_non_destructive_testing'] ? $viewData['calculation']['standard_non_destructive_testing']['custom_id'] : '';
                            if($text != '' && $viewData['calculation']['non_destructive_testing']['name']) {
                                $text .= ' / ' . $viewData['calculation']['non_destructive_testing']['name'];
                            } else {
                                $text .= $viewData['calculation']['non_destructive_testing']['name'];
                            }
                        ?>
                        <td style="padding: 5px; border: 1px solid black;">{{ $text }}</td>
                    @else
                        <td style="padding: 5px; border: 1px solid black;"></td>
                    @endif
                </tr>
                <tr>
                    <td rowspan="3" style="padding: 5px; border: 1px solid black;"></td>
                    <td style="padding: 5px; border: 1px solid black;">US-Norm</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && isset($viewData['calculation']['non_destructive_testing']) && $viewData['calculation']['non_destructive_testing'] != [] && isset($viewData['calculation']['non_destructive_testing']['us_norm']) && $viewData['calculation']['non_destructive_testing']['us_norm'] != [] ? $viewData['calculation']['non_destructive_testing']['us_norm']['custom_id'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">MT-Norm</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && isset($viewData['calculation']['non_destructive_testing']) && $viewData['calculation']['non_destructive_testing'] != [] && isset($viewData['calculation']['non_destructive_testing']['non_destructive_norm']) && $viewData['calculation']['non_destructive_testing']['non_destructive_norm'] != [] && isset($viewData['calculation']['non_destructive_testing']['non_destructive_norm']['norm']) && $viewData['calculation']['non_destructive_testing']['non_destructive_norm']['norm'] != [] ? $viewData['calculation']['non_destructive_testing']['non_destructive_norm']['norm']['custom_id'] : '' }}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid black;">EFG</td>
                    <td style="padding: 5px; border: 1px solid black;">{{ $viewData['calculation'] && $viewData['calculation']['non_destructive_testing'] && $viewData['calculation']['non_destructive_testing'] != [] && isset($viewData['calculation']['non_destructive_testing']['ultrasound_efg_max']) ? $viewData['calculation']['non_destructive_testing']['ultrasound_efg_max'] : '' }}</td>
                </tr>
                <!-- Start RESIDUAL MATERIALS -->
                <tr>
                    <td style="padding: 5px; border: 1px solid black;"><strong>{{ __('messages.hwekalkOfferSummary.mainContent.restmaterial') }}</strong></td>
                    <td style="padding: 5px; border: 1px solid black;"><strong>ID / {{ __('messages.hwekalkOfferSummary.mainContent.name') }} : </strong></td>
                    @if($viewData['calculation'] && $viewData['calculation']['residual_material'] && $viewData['calculation']['residual_material'] != [])
                        <?php $text = $viewData['calculation']['standard_residual_material'] ? $viewData['calculation']['standard_residual_material']['custom_id'] : '';
                            if($text != '' && $viewData['calculation']['residual_material']['name']) {
                                $text .= ' / ' . $viewData['calculation']['residual_material']['name'];
                            } else {
                                $text .= $viewData['calculation']['residual_material']['name'];
                            }
                        ?>
                        <td style="padding: 5px; border: 1px solid black;">{{ $text }}</td>
                    @else
                        <td style="padding: 5px; border: 1px solid black;"></td>
                    @endif
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="cost-section" style="page-break-before: always;">
        <table class="table table-bordered table-striped" style="border: 1px solid black;">
            <thead>
                <tr>
                    <th colspan="8" style="color: white; padding: 5px; font-size: 16px; border: 1px solid black;background-color: #005981">{{ __('messages.hwekalkOfferSummary.mainContent.cost') }} {{ __('messages.hwekalkOfferSummary.mainContent.conditional_text.table') }} </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th style="padding: 5px; border: 1px solid black;text-align: center;">{{ __('messages.hwekalkOfferSummary.mainContent.name') }}</th>
                    <th style="padding: 5px; border: 1px solid black;text-align: center;">{{ __('messages.hwekalkOfferSummary.mainContent.quantity') }}</th>
                    <th style="padding: 5px; border: 1px solid black;text-align: center;">{{ __('messages.hwekalkOfferSummary.mainContent.unit') }}</th>
                    <th style="padding: 5px; border: 1px solid black;text-align: center;">{{ __('messages.hwekalkOfferSummary.mainContent.factor') }}</th>
                    <th style="padding: 5px; border: 1px solid black;text-align: center;">{{ __('messages.hwekalkOfferSummary.mainContent.cost_status') }}</th>
                    <th style="padding: 5px; border: 1px solid black;text-align: center;">{{ __('messages.hwekalkOfferSummary.mainContent.type') }}</th>
                    <th style="padding: 5px; border: 1px solid black;text-align: center;">{{ __('messages.hwekalkOfferSummary.mainContent.cost_per_piece') }}</th>
                    <th style="padding: 5px; border: 1px solid black;text-align: center;">{{ __('messages.hwekalkOfferSummary.mainContent.lead_time_days') }}</th>
                </tr>
                @if($viewData['groupByCosts'] && sizeof($viewData['groupByCosts']) > 0)
                @foreach($viewData['groupByCosts'] as $groupCost)
                    @if($groupCost['items'] && sizeof($groupCost['items']) > 0)
                        @foreach($groupCost['items'] as $cost)
                        <tr>
                            <td style="padding: 5px; border: 1px solid black;">{{ $cost['name'] }}</td>
                            <td style="padding: 5px; border: 1px solid black;text-align: right;">{{ $cost['quantity'] }}</td>
                            <td style="padding: 5px; border: 1px solid black;">{{ $cost['unit'] }}</td>
                            <td style="padding: 5px; border: 1px solid black;text-align: right;">{{ $cost['factor'] }}</td>
                            <td style="padding: 5px; border: 1px solid black;text-align: right;">{{ round($cost['price'], 2) }} &euro;</td>
                            <td style="padding: 5px; border: 1px solid black;">{{ $cost['hwe_cost_calc_type'] ? __('messages.hwekalkOfferSummary.enums.'.$cost['hwe_cost_calc_type']) : '' }}</td>
                            <td style="padding: 5px; border: 1px solid black;text-align: right;">{{ round($cost['cost'], 2) }} &euro;</td>
                            <td style="padding: 5px; border: 1px solid black;text-align: right;">{{ $cost['lead_time_days'] }}</td>
                        </tr>
                        @endforeach
                    @else 
                        <tr></tr>
                    @endif
                    <tr>
                        <td colspan="6" style="padding: 5px; text-align: right;font-size: 12px;"><strong>{{ $groupCost['name'] && $groupCost['name'] != null ? $groupCost['name'] : '' }}</strong></td>
                        <td style="padding: 5px; border: 1px solid black;text-align: right;font-size: 12px;"><strong>{{ round($groupCost['costSum'], 2) }} &euro;</strong></td>
                        <td style="padding: 5px; text-align: right;font-size: 12px;"><strong>{{ $groupCost['leadSum'] }} {{ __('messages.hwekalkOfferSummary.mainContent.days') }}</strong></td>
                    </tr>
                @endforeach
                @endif
            </tbody>
        </table>
    </div>
</div>
@endsection

@section('footer-page-script') 
<script type="text/php">
    if(isset($pdf)) { 
        $pdf->page_script('
            $x = 270;
            $y = 810;
            $font = $fontMetrics->get_font("Arial, Helvetica, sans-serif", "bold");
            $size = 6;
            $color = array(0,0,0,1);
            $word_space = 0.0;
            $char_space = 0.0;
            $angle = 0.0;
            $text = "{{ $pageSettings['footer_page_text'] }} {PAGE_NUM} / {PAGE_COUNT}";
            $pdf->page_text($x, $y, $text, $font, $size, $color, $word_space, $char_space, $angle);
        ');
    }
</script>
@endsection