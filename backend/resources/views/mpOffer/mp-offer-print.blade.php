@section('custom-header')
    <table>
        <tr>
            <th style="width: 80px; margin-right: 15px; font-size: 14px;">{{ __('messages.mpOfferPdf.mainContent.offer') }}</th>
            <td style="width: 100px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.num') }} {{ $mpOffer['custom_id'] }}</td>
            <td style="width: 50px; margin-right: 5px;">V. {{ $mpOffer['version'] }}</td>
            <td style="width: 80px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.offerType') }}: {{ $mpOffer['mp_offer_type'] ? __('messages.mpOfferPdf.enums.'.$mpOffer['mp_offer_type']) : '' }}</td>
            <td style="width: 100px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.date') }}: {{ $mpOffer['date'] }}</td>
        </tr>
    </table>
@endsection

@section('custom-footer')
    <table style="width: 600px; height: 20px;z-index: 9999; margin-top: 10px;">
        <tbody>
            <tr style="font-size: 10px; color: rgb(0,0,0,0.7);">
                <th style="width: 100px;">MOD 3.1.1_02</th>
                <th style="width: 100px;">{{ $pageSettings['current_time'] }}</th>
            </tr>
        </tbody>
    </table>
@endsection

@section('content')
<div class="offer-main-container" style="margin: 0; width: 100vw; height: 90vh; top: 80px;">
    <!-- Offer header -->
    <div class="offer-header" style="width: 100%; height: 280px; margin-bottom: 10px;">
        <div class="header-left-side" style=" float: left; position: absolute; left: 0; width: 50%;">
            <div class="offer-details">
                <table class="details-table">
                    <tbody>
                        <tr>
                            <th style="text-align: left; width: 150px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.toolDescription') }}</th>
                            <td style="width: 300px; margin-right: 5px; text-align: left;">{{ $mpOffer['name'] ?? '----'}}</td>
                        </tr>
                        <tr>
                            <th style="text-align: left; width: 150px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.customer') }}</th>
                            <td style="width: 300px; margin-right: 5px; text-align: left;">{{ $mpOffer['customer'] ? $mpOffer['customer']['name'] : '' }}</td>
                        </tr>
                        <tr>
                            <th style="text-align: left; width: 150px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.finalCustomer') }}</th>
                            <td style="width: 300px; margin-right: 5px; text-align: left;">{{ $mpOffer['final_customer'] ? $mpOffer['final_customer']['name'] : '' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="offer-summery" style="margin-top: 10px; padding: 5px; border: 1px solid rgba(0, 0, 0, 0.5);">
                <div class="summery-header" style=" font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: bold; color: #999999;">
                    {{ __('messages.mpOfferPdf.mainContent.totals') }}
                </div>
                <div class="summery-table">
                    <table>
                        <thead>
                            <tr>
                                <th style="color: #999999; width: 150px; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.descr') }}</th>
                                <th style="color: #999999; width: 95px; text-align: right; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.cost') }}</th>
                                <th style="color: #999999; width: 80px; text-align: right; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.surplus') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="width: 150px; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.material') }}</td>
                                <td style="width: 95px; text-align: right; margin-right: 5px;">{{ $mpOffer['material_total'] }} &euro;</td>
                                <td style="width: 80px; text-align: right; margin-right: 5px;">
                                    {{ $mpOffer['surplus_material'] ? $mpOffer['surplus_material'] : 0 }}%</td>
                            </tr>
                            <tr>
                                <td style="width: 150px; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.external') }}</td>
                                <td style="width: 95px; text-align: right; margin-right: 5px;">{{ $mpOffer['external_total'] }} &euro;</td>
                                <td style="width: 80px; text-align: right; margin-right: 5px;">
                                    {{ $mpOffer['surplus_external'] ? $mpOffer['surplus_external'] : 0 }}%</td>
                            </tr>
                            <tr>
                                <td style="width: 150px; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.internal') }} {{ __('messages.mpOfferPdf.mainContent.personnel') }}</td>
                                <td style="width: 95px; text-align: right; margin-right: 5px;">{{ $mpOffer['internal_person_total_hours'] }}h&nbsp;&nbsp;{{ $mpOffer['internal_personal_total'] }} &euro;</td>
                                <td style="width: 80px; text-align: right; margin-right: 5px;">
                                    {{ $mpOffer['surplus_internal_personnel'] ? $mpOffer['surplus_internal_personnel'] : 0 }}%</td>
                            </tr>
                            <tr>
                                <td style="width: 150px; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.internal') }} {{ __('messages.mpOfferPdf.mainContent.machine') }}</td>
                                <td style="width: 95px; text-align: right; margin-right: 5px;">{{ $mpOffer['internal_machine_total_hours'] }}h&nbsp;&nbsp;{{ $mpOffer['internal_machine_total'] }} &euro;</td>
                                <td style="width: 80px; text-align: right; margin-right: 5px;">
                                    {{ $mpOffer['surplus_internal_machine'] ? $mpOffer['surplus_internal_machine'] : 0 }}%</td>
                            </tr>
                            <!-- <tr>
                                <td style="width: 150px; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.internal') }}</td>
                                <td style="width: 95px; text-align: right; margin-right: 5px;">{{ $mpOffer['internal_total_hours'] }}h&nbsp;&nbsp;{{ $mpOffer['internal_total'] }} &euro;</td>
                                <td style="width: 80px; text-align: right; margin-right: 5px;">
                                    {{ $mpOffer['surplus_internal'] ? $mpOffer['surplus_internal'] : 0 }}%</td>
                            </tr> -->
                            <tr>
                                <td style="width: 150px; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.total') }}</td>
                                <td style="width: 95px; text-align: right; margin-right: 5px;">{{ $mpOffer['offer_total'] }} &euro;</td>
                                <td style="width: 80px; text-align: right; margin-right: 5px;">{{ $mpOffer['total_surplus_perc'] }}%</td>
                            </tr>
                            <tr>
                                <td style="width: 150px; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.priceWithSurplus') }}</td>
                                <td style="width: 95px; text-align: right; margin-right: 5px;">{{ $mpOffer['price_with_surplus'] }} &euro;</td>
                                <td style="width: 80px; text-align: right; margin-right: 5px;">
                                    {{ $mpOffer['surplus_total'] ? $mpOffer['surplus_total'] : 0 }}%</td>
                            </tr>
                            <tr>
                                <td style="width: 150px; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.margin') }}</td>
                                <td style="width: 95px; text-align: right; margin-right: 5px;">{{ $mpOffer['margin_total'] }} &euro;</td>
                                <td style="width: 80px; text-align: right; margin-right: 5px;">{{ $mpOffer['margin_perc'] }}%</td>
                            </tr>
                            <tr>
                                <th style="width: 150px; text-align: left; margin-right: 5px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.salesPrice') }}</th>
                                <th style="width: 95px; text-align: right;">{{ $mpOffer['total_sales'] }} &euro;</th>
                                <td style="width: 80px; text-align: right; margin-right: 5px;"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-image" style="float: right; position: absolute; width: 50%; right: 0; text-align: center;">
            @if($mpOffer['image'] != null)
            <img src="data:image/png;base64,'.{{ $mpOffer['image'] }}'" style="width: 280px; height: 250px;">
            @endif
        </div>
    </div>
    <!-- Offer header end -->

    <!-- Offer and Offer Pos Details -->
    <div class="offer-body" style="width: 100%; height: 500px;">
        <div class="root-items-section" style="margin-bottom: 10px; page-break-after: always;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="width: 100%; height: 25px; padding: 0; color: white; background-color: #999999;">
                    <span style="font-size: 12px; line-height: 20px; padding-top: 50px; margin: 50px 0 0 5px;">{{ __('messages.mpOfferPdf.mainContent.tool') }}</span>
                </div>
                <div class="card-body" style="margin: 10px 0; padding: 0;">
                    <div class="child-table" style="border: 1px solid rgba(0, 0, 0, 0.5); margin-bottom: 5px; padding: 5px 5px 0;">
                        <table class="description-table" style=" width: 100%; margin-bottom: 10px; page-break-inside: avoid;">
                            <thead>
                                <tr>
                                    <th style="color: #999999; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.description') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.toolType') }}</td>
                                    <td colspan="3" style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['tool_type'] ? __('messages.mpOfferPdf.enums.'.$mpOffer['tool_type']) : '----' }}</td>
                                    <td style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.constructionOf') }}</td>
                                    <td colspan="3" style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['construction_type'] ? __('messages.mpOfferPdf.enums.'.$mpOffer['construction_type']) : '----' }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.press') }} (ton)</td>
                                    <td colspan="3" style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['press_weight'] ?? 0 }}</td>
                                    <td style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.quantityImprint') }}</td>
                                    <td colspan="3" style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['quantity_imprint'] }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.maxDimension') }} (mm)</td>
                                    <td style="width:70px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ number_format($mpOffer['max_length'], 0, '', '.') ?? 0 }}</td>
                                    <td style="width:70px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ number_format($mpOffer['max_height'], 0, '', '.') ?? 0 }}</td>
                                    <td style="width:70px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ number_format($mpOffer['max_width'], 0, '', '.') ?? 0 }}</td>
                                    <td style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.estWeight') }} (kg)</td>
                                    <td colspan="3" style="width: 140px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['weight'] ?? 0 }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="child-table" style="border: 1px solid rgba(0, 0, 0, 0.5); margin-bottom: 5px; padding: 5px 5px 0;">
                        <table class="piece-table" style=" width: 100%; margin-bottom: 10px; page-break-inside: avoid;">
                            <thead>
                                <tr>
                                    <th style="color: #999999; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.pieces') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="width: 50px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.dimension') }}</td>
                                    <td style="width: 50px; height: 20px; text-align: right; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.length') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: right; margin-right: 5px;">
                                        {{ number_format($mpOffer['length'], 2, ',', '.') ?? 0 }} mm</td>
                                    <td style="width: 50px; height: 20px; text-align: right; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.width') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: right; margin-right: 5px;">
                                        {{ number_format($mpOffer['width'], 2, ',', '.') ?? 0 }} mm</td>
                                    <td style="width: 50px; height: 20px; text-align: right; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.height') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: right; margin-right: 5px;">
                                        {{ number_format($mpOffer['height'], 2, ',', '.') ?? 0 }} mm</td>
                                    <td style="width: 50px; height: 20px; text-align: right; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.spec') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: right; margin-right: 5px;">
                                        {{ number_format($mpOffer['size'], 2, ',', '.') ?? 0 }} mm</td>
                                    <td style="width: 100px; height: 20px; text-align: left; margin-right: 5px;"></td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="width: 100px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.projectedArea') }} (cm2)</td>
                                    <td style="width: 20px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ number_format($mpOffer['projected_area'], 2, ',', '.') }}</td>
                                    <td colspan="2" style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.totalVolumnImprint') }} (cm3)</td>
                                    <td style="width: 20px; height: 20px; text-align: left;">
                                        {{ number_format($mpOffer['imprint_volume'], 2, ',', '.') ?? 0 }}</td>
                                    <td colspan="2" style="width: 20px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.material') }}</td>
                                    <td colspan="2" style="width: 200px; height: 20px; text-align:left; margin-right: 5px;">
                                        {{ $mpOffer['material'] }}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="width: 80px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.guaranteeStatus') }}</td>
                                    <td style="width: 20px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ number_format($mpOffer['shots_guaranteed'], 2, ',', '.') }}</td>
                                    <td colspan="2" style="width: 20px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.finishingVisible') }}</td>
                                    <td style="width: 80px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['finishing_visible'] }}</td>
                                    <td colspan="2" style="width: 80px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.finishingNotVisible') }}</td>
                                    <td colspan="2" style="width: 200px; height: 20px; text-align:left; margin-right: 5px;">
                                        {{ $mpOffer['finishing_not_visible'] }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="child-table" style="border: 1px solid rgba(0, 0, 0, 0.5); margin-bottom: 5px; padding: 5px 5px 0;">
                        <table class="injection-table" style=" width: 100%; margin-bottom: 10px; page-break-inside: avoid;">
                            <thead>
                                <tr>
                                    <th style="color: #999999; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.injection') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.injection') }} 1</td>
                                    <td style="width: 70px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['injection_type'] ? __('messages.mpOfferPdf.enums.'.$mpOffer['injection_type']) : '----' }}</td>
                                    <td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.nozzleQty') }}</td>
                                    <td style="width: 70px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ number_format($mpOffer['nozzle_quantity'], 2, ',', '.') }}</td>
                                    <td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.type') }}</td>
                                    <td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['nozzle_type'] ? __('messages.mpOfferPdf.enums.'.$mpOffer['nozzle_type']) : '----' }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.injection') }} 2</td>
                                    <td style="width: 70px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['injection_type_2'] ? __('messages.mpOfferPdf.enums.'.$mpOffer['injection_type_2']) : '----' }}</td>
                                    <td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.nozzleQty') }}</td>
                                    <td style="width: 70px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ number_format($mpOffer['nozzle_quantity_2'], 2, ',', '.') }}</td>
                                    <td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.type') }}</td>
                                    <td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['nozzle_type_2'] ? __('messages.mpOfferPdf.enums.'.$mpOffer['nozzle_type_2']) : '----' }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.injectionNote') }}</td>
                                    <td colspan="5" style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['injection_note'] }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="child-table" style="border: 1px solid rgba(0, 0, 0, 0.5); margin-bottom: 5px; padding: 5px 5px 0;">
                        <table class="movement-table" style=" width: 100%; margin-bottom: 10px; page-break-inside: avoid;">
                            <thead>
                                <tr>
                                    <th style="color: #999999; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.movement') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="width: 100px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.movement') }}</td>
                                    <td style="width: 30px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['has_movements'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                    <td colspan="6"></td>
                                </tr>
                                @if($mpOffer['has_movements'])
                                <tr>
                                    <td style="width: 100px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.mechanic') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['movements_mechanic'] }}</td>
                                    <td style="width: 100px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.hydroaulic') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['movements_hydraulic'] }}</td>
                                    <td style="width: 100px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.inclinedRods') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['rods'] ?? 0 }}</td>
                                    <td style="width: 100px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.unscrewing') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['unscrewing'] ?? 0 }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 100px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.jowls') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['jowls'] ?? 0 }}</td>
                                    <td style="width: 100px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.thirdPlate') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['has_third_plate'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                    <td style="width: 100px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.doubleExtraction') }}</td>
                                    <td style="width: 40px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['has_double_extraction'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                </tr>
                                @endif
                            </tbody>
                        </table>
                    </div>
                    <div class="child-table" style="border: 1px solid rgba(0, 0, 0, 0.5); margin-bottom: 5px; padding: 5px 5px 0;">
                        <table class="extraction-table" style=" width: 100%; margin-bottom: 10px; page-break-inside: avoid;">
                            <thead>
                                <tr>
                                    <th style="color: #999999; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.extraction') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.type') }}</td>
                                    <td colspan="2" style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['extraction_type'] ? __('messages.mpOfferPdf.enums.'.$mpOffer['extraction_type']) : '----' }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.roundedExtrator') }}</td>
                                    <td style="width: 30px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['is_rounded_extractor'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                    <td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.tubularExtractor') }}</td>
                                    <td style="width: 30px; height: 20px; text-align: left;">
                                        {{ $mpOffer['is_tubular_extractor'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                    <td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.tearExtractor') }}</td>
                                    <td style="width: 30px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['is_tear_extractor'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.squareExtractor') }}</td>
                                    <td style="width: 30px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['is_square_extractor'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                    <td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.lathsRings') }}</td>
                                    <td style="width: 30px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['has_laths_rings'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                    <td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.extractionHelpFixed') }}</td>
                                    <td style="width: 30px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['is_extraction_help_fixed'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 180px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ __('messages.mpOfferPdf.mainContent.hydroaulicExtractionFixed') }}</td>
                                    <td style="width: 30px; height: 20px; text-align: left; margin-right: 5px;">
                                        {{ $mpOffer['is_hydraulic_extraction_fixed'] ? __('messages.mpOfferPdf.mainContent.yes') : __('messages.mpOfferPdf.mainContent.no') }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="offer-child material-cost-section" style="margin-bottom: 10px; page-break-inside: avoid;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="height: 25px; padding: 0 5px; color: white; background-color: #999999;">
                    <table>
                        <tr style="font-size: 12px;">
                            <td colspan="5" style="width: 400px; height: 20px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.rawMaterial') }}</td>
                            <td colspan="3" style="width: 300px; height: 20px; text-align: right;">{{ $mpOffer['material_cost_total'] }} &euro;</td>
                        </tr>
                    </table>
                </div>
                <div class="card-body" style="margin: 10px 0; padding: 0;">
                    <table class="pos-child-table material-cost-table" style="width: 708px; padding: 0 5px;">
                        <thead style="min-height: 20px;">
                            <tr>
                                <th colspan="2" style="width: 180px; text-align: left; color: #999999; margin-right: 5px;"></th>
                                <th style="text-align: left; color: #999999; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.material') }}</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">&euro;/kg</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">L(mm)</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">W(mm)</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">H(mm)</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.cost') }}</th>
                            </tr>
                        </thead>
                        <tbody style="min-height: 50px;">
                            @if($mpOffer['mp_offer_pos'])
                            @foreach($mpOffer['mp_offer_pos'] as $offerPos)
                            @if($offerPos['cost_group'] == 'MATERIAL' && $offerPos['cost_sub_group'] == 'MATERIAL_INTERNAL')
                            <tr>
                                @if($offerPos['cost_type'] == 'DIMENSION' && $offerPos['total'] != 0)
                                @include('mpOffer/type-dimension', [ 'offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'FIXED' && $offerPos['total'] != 0)
                                @include('mpOffer/type-fixed', ['offerPos' => $offerPos])
                                @endif
                            </tr>
                            @endif
                            @endforeach
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-child raw-material-section" style="margin-bottom: 10px; page-break-inside: avoid;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="height: 25px; padding: 0 5px; color: white; background-color: #999999;">
                    <table>
                        <tr style="font-size: 12px;">
                            <td colspan="5" style="width: 400px; height: 20px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.materialAcquired') }}</td>
                            <td colspan="3" style="width: 300px; height: 20px; text-align: right;">{{ $mpOffer['raw_material_total'] }} &euro;</td>
                        </tr>
                    </table>
                </div>
                <div class="card-body" style="margin: 10px 0; padding: 0;">
                    <table class="pos-child-table raw-material-table" style="width: 708px; padding: 0 5px;">
                        <thead style="min-height: 20px;">
                            <tr>
                                <th style="color: #999999; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.details') }}</th>
                            </tr>
                        </thead>
                        <tbody style="min-height: 50px;">
                            @if($mpOffer['mp_offer_pos'])
                            @foreach($mpOffer['mp_offer_pos'] as $offerPos)
                            @if($offerPos['cost_group'] == 'MATERIAL' && $offerPos['cost_sub_group'] == 'MATERIAL_ACQUIRED')
                            <tr>
                                @if($offerPos['cost_type'] == 'PIECES' && $offerPos['total'] != 0)
                                @include('mpOffer/type-pieces', [ 'offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'WEIGHT' && $offerPos['total'] != 0)
                                @include('mpOffer/type-weight', ['offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'PF_PM' && $offerPos['total'] != 0)
                                @include('mpOffer/type-pf-pm', ['offerPos' => $offerPos])
                                @elseif(($offerPos['cost_type'] == 'FIXED' || $offerPos['cost_type'] == 'FIXED_NAME') && $offerPos['total'] != 0)
                                @include('mpOffer/type-fixed', ['offerPos' => $offerPos])
                                @endif
                            </tr>
                            @endif
                            @endforeach
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-child external-cost-section" style="margin-bottom: 10px; page-break-inside: avoid; page-break-after: always;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="height: 25px; padding: 0 5px; color: white; background-color: #999999;">
                    <table>
                        <tr style="font-size: 12px;">
                            <td colspan="5" style="width: 400px; height: 20px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.externalCost') }}</td>
                            <td colspan="3" style="width: 300px; height: 20px; text-align: right;">{{ $mpOffer['external_total'] }} &euro;</td>
                        </tr>
                    </table>
                </div>
                <div class="card-body" style="margin: 10px 0; padding: 0;">
                    <table class="pos-child-table external-cost-table" style="width: 708px; padding: 0 5px;">
                        <thead style="min-height: 20px;">
                            <tr>
                                <th style="color: #999999; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.details') }}</th>
                            </tr>
                        </thead>
                        <tbody style="min-height: 50px;">
                            @if($mpOffer['mp_offer_pos'])
                            @foreach($mpOffer['mp_offer_pos'] as $offerPos)
                            @if($offerPos['cost_group'] == 'EXTERNAL' && $offerPos['cost_sub_group'] == 'EXTERNAL')
                            <tr>
                                @if($offerPos['cost_type'] == 'OFFER' && $offerPos['total'] != 0)
                                @include('mpOffer/type-offer', [ 'offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'FIXED_WEIGHT' && $offerPos['total'] != 0)
                                @include('mpOffer/type-fixed-weight', ['offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'WEIGHT' && $offerPos['total'] != 0)
                                @include('mpOffer/type-weight', ['offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'MOULDFLOW' && $offerPos['total'] != 0)
                                @include('mpOffer/type-mouldflow', ['offerPos' => $offerPos])
                                @elseif(($offerPos['cost_type'] == 'FIXED' || $offerPos['cost_type'] == 'FIXED_NAME')  && $offerPos['total'] != 0)
                                @include('mpOffer/type-fixed', ['offerPos' => $offerPos])
                                @endif
                            </tr>
                            @endif
                            @endforeach
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-child technical-office-section" style="margin-bottom: 5px; page-break-inside: avoid;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="height: 25px; padding: 0 5px; color: white; background-color: #999999;">
                    <table>
                        <tr style="font-size: 12px;">
                            <td colspan="2" style="width: 270px; height: 20px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.technicalOffice') }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['tech_office_total_hours'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['tech_office_per_hour_total'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['tech_office_mach_hour_total'] }}</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['technical_office_person_total'] }} &euro;</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['technical_office_mach_total'] }} &euro;</td>
                            <td style="width: 85px; height: 20px; text-align: right;">{{ $mpOffer['technical_office_total'] }} &euro;</td>
                        </tr>
                    </table>
                </div>
                <div class="card-body" style="margin: 3px 0; padding: 0;">
                    <table class="pos-child-table internal-table technical-office-table" style="padding: 0 5px;">
                        <thead>
                            <tr>
                                <th style="color: #999999; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.details') }}</th>
                                <th colspan="2" style="color: #999999; text-align: left; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.machine') }}</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">h</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">h NP</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">€ Op</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">€ M</th>
                                <th style="color: #999999; text-align: right; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.total') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @if($mpOffer['mp_offer_pos'])
                            @foreach($mpOffer['mp_offer_pos'] as $offerPos)
                            @if($offerPos['cost_group'] == 'INTERNAL' && $offerPos['cost_sub_group'] == 'INTERNAL_TECH_OFFICE')
                            <tr>
                                @if($offerPos['cost_type'] == 'HOURS')
                                @include('mpOffer/type-hours', [ 'offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'HOURS_FIXED')
                                @include('mpOffer/type-hours-fixed', ['offerPos' => $offerPos])
                                @endif
                            </tr>
                            @endif
                            @endforeach
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-child machining-section" style="margin-bottom: 5px; page-break-inside: avoid;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="height: 25px; padding: 0 5px; color: white; background-color: #999999;">
                    <table>
                        <tr style="font-size: 12px;">
                            <td colspan="2" style="width: 270px; height: 20px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.machining') }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['machining_total_hours'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['machining_per_hour_total'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['machining_mach_hour_total'] }}</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['machining_person_total'] }} &euro;</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['machining_mach_total'] }} &euro;</td>
                            <td style="width: 85px; height: 20px; text-align: right;">{{ $mpOffer['machining_total'] }} &euro;</td>
                        </tr>
                    </table>
                </div>
                <div class="card-body" style="margin: 3px 0; padding: 0;">
                    <table class="pos-child-table internal-table machining-table" style="padding: 0 5px;">
                        <tbody>
                            @if($mpOffer['mp_offer_pos'])
                            @foreach($mpOffer['mp_offer_pos'] as $offerPos)
                            @if($offerPos['cost_group'] == 'INTERNAL' && $offerPos['cost_sub_group'] == 'INTERNAL_MACHINING')
                            <tr>
                                @if($offerPos['cost_type'] == 'HOURS')
                                @include('mpOffer/type-hours', [ 'offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'HOURS_FIXED')
                                @include('mpOffer/type-hours-fixed', ['offerPos' => $offerPos])
                                @endif
                            </tr>
                            @endif
                            @endforeach
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-child erosion-section" style="margin-bottom: 5px; page-break-inside: avoid;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="height: 25px; padding: 0 5px; color: white; background-color: #999999;">
                    <table>
                        <tr style="font-size: 12px;">
                            <td colspan="2" style="width: 270px; height: 20px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.erosion') }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['erosion_total_hours'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['erosion_per_hour_total'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['erosion_mach_hour_total'] }}</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['erosion_person_total'] }} &euro;</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['erosion_mach_total'] }} &euro;</td>
                            <td style="width: 85px; height: 20px; text-align: right;">{{ $mpOffer['erosion_total'] }} &euro;</td>
                        </tr>
                    </table>
                </div>
                <div class="card-body" style="margin: 3px 0; padding: 0;">
                    <table class="pos-child-table internal-table erosion-table" style="padding: 0 5px;">
                        <tbody>
                            @if($mpOffer['mp_offer_pos'])
                            @foreach($mpOffer['mp_offer_pos'] as $offerPos)
                            @if($offerPos['cost_group'] == 'INTERNAL' && $offerPos['cost_sub_group'] == 'INTERNAL_EROSION')
                            <tr>
                                @if($offerPos['cost_type'] == 'HOURS')
                                @include('mpOffer/type-hours', [ 'offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'HOURS_FIXED')
                                @include('mpOffer/type-hours-fixed', ['offerPos' => $offerPos])
                                @endif
                            </tr>
                            @endif
                            @endforeach
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-child assembly-section" style="margin-bottom: 5px; page-break-inside: avoid;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="height: 25px; padding: 0 5px; color: white; background-color: #999999;">
                    <table>
                        <tr style="font-size: 12px;">
                            <td colspan="2" style="width: 270px; height: 20px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.assembly') }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['assembly_total_hours'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['assembly_per_hour_total'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['assembly_mach_hour_total'] }}</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['assembly_person_total'] }} &euro;</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['assembly_mach_total'] }} &euro;</td>
                            <td style="width: 85px; height: 20px; text-align: right;">{{ $mpOffer['assembly_total'] }} &euro;</td>
                        </tr>
                    </table>
                </div>
                <div class="card-body" style="margin: 3px 0; padding: 0;">
                    <table class="pos-child-table internal-table assembly-table" style="padding: 0 5px;">
                        <tbody>
                            @if($mpOffer['mp_offer_pos'])
                            @foreach($mpOffer['mp_offer_pos'] as $offerPos)
                            @if($offerPos['cost_group'] == 'INTERNAL' && $offerPos['cost_sub_group'] == 'INTERNAL_ASSEMBLY')
                            <tr>
                                @if($offerPos['cost_type'] == 'HOURS')
                                @include('mpOffer/type-hours', [ 'offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'HOURS_FIXED')
                                @include('mpOffer/type-hours-fixed', ['offerPos' => $offerPos])
                                @endif
                            </tr>
                            @endif
                            @endforeach
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-child sampling-section" style="margin-bottom: 5px; page-break-inside: avoid;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="height: 25px; padding: 0 5px; color: white; background-color: #999999;">
                    <table>
                        <tr style="font-size: 12px;">
                            <td colspan="2" style="width: 270px; height: 20px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.sampling') }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['sampling_total_hours'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['sampling_per_hour_total'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['sampling_mach_hour_total'] }}</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['sampling_person_total'] }} &euro;</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['sampling_mach_total'] }} &euro;</td>
                            <td style="width: 85px; height: 20px; text-align: right;">{{ $mpOffer['sampling_total'] }} &euro;</td>
                        </tr>
                    </table>
                </div>
                <div class="card-body" style="margin: 3px 0; padding: 0;">
                    <table class="pos-child-table internal-table sampling-table" style="padding: 0 5px;">
                        <tbody>
                            @if($mpOffer['mp_offer_pos'])
                            @foreach($mpOffer['mp_offer_pos'] as $offerPos)
                            @if($offerPos['cost_group'] == 'INTERNAL' && $offerPos['cost_sub_group'] == 'INTERNAL_SAMPLING' && $offerPos['showRow'] == true)
                            <tr>
                                @if($offerPos['cost_type'] == 'HOURS')
                                @include('mpOffer/type-hours', [ 'offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'HOURS_FIXED')
                                @include('mpOffer/type-hours-fixed', ['offerPos' => $offerPos])
                                @endif
                            </tr>
                            @endif
                            @endforeach
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-child quality-control-section" style="margin-bottom: 5px; page-break-inside: avoid;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="height: 25px; padding: 0 5px; color: white; background-color: #999999;">
                    <table>
                        <tr style="font-size: 12px;">
                            <td colspan="2" style="width: 270px; height: 20px; margin-right: 5px;">{{ __('messages.mpOfferPdf.mainContent.qualityControl') }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['quality_con_total_hours'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['quality_con_per_hour_total'] }}</td>
                            <td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['quality_con_mach_hour_total'] }}</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['quality_control_person_total'] }} &euro;</td>
                            <td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">{{ $mpOffer['quality_control_mach_total'] }} &euro;</td>
                            <td style="width: 85px; height: 20px; text-align: right;">{{ $mpOffer['quality_control_total'] }} &euro;</td>
                        </tr>
                    </table>
                </div>
                <div class="card-body" style="margin: 3px 0; padding: 0;">
                    <table class="pos-child-table internal-table quality-control-table" style="padding: 0 3px;">
                        <tbody>
                            @if($mpOffer['mp_offer_pos'])
                            @foreach($mpOffer['mp_offer_pos'] as $offerPos)
                            @if($offerPos['cost_group'] == 'INTERNAL' && $offerPos['cost_sub_group'] == 'INTERNAL_QUALITY')
                            <tr>
                                @if($offerPos['cost_type'] == 'HOURS')
                                @include('mpOffer/type-hours', [ 'offerPos' => $offerPos])
                                @elseif($offerPos['cost_type'] == 'HOURS_FIXED')
                                @include('mpOffer/type-hours-fixed', ['offerPos' => $offerPos])
                                @endif
                            </tr>
                            @endif
                            @endforeach
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="offer-child notes-section" style="margin-bottom: 10px; page-break-inside: avoid;">
            <div class="card" style="width: 100vw; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); border: none; background: none;">
                <div class="card-header" style="width: 100%; height: 25px; padding: 0; color: white; background-color: #999999;">
                    <span style="font-size: 12px; line-height: 20px; padding-top: 50px; margin: 50px 0 0 5px;">
                        {{ __('messages.mpOfferPdf.mainContent.notes') }}
                    </span>
                </div>
                <div class="card-body" style="margin: 10px 5px; padding: 0;">
                    <p>{!! $mpOffer['note'] !!}</p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer-page-script') 
<script type="text/php">
    if(isset($pdf)) {
        $pdf->page_script('
            $x = 515;
            $y = 810;
            $font = $fontMetrics->get_font("Arial, Helvetica, sans-serif", 100);
            $size = 9;
            $color = array(0,0,0,0.7);
            $word_space = 0.0;
            $char_space = 0.0;
            $angle = 0.0;
            if ($PAGE_COUNT > 1) {
                $text = "{{ $pageSettings['footer_page_text'] }} {PAGE_NUM} / {PAGE_COUNT}";
                $pdf->page_text($x, $y, $text, $font, $size, $color, $word_space, $char_space, $angle);
            }
        ');
    }
</script>
@endsection