<td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['name'] ?? '' }}</td>
<td style="width: 10px; height: 20px; text-align: left; margin-right: 5px;"></td>
<td style="width: 110px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['supplier'] ? $offerPos['supplier']['name'] : '' }}</td>
<td style="width: 30px; height: 20px; text-align: right; margin-right: 5px;">
{{ __('messages.mpOfferPdf.mainContent.date') }}</td>
<td style="width: 95px; height: 20px; text-align: center; margin-right: 5px;">
{{ $offerPos['supplier_offer_date'] ?? '' }}</td>
<td style="width: 30px; height: 20px; text-align: right; margin-right: 5px;">
{{ __('messages.mpOfferPdf.mainContent.offer') }}</td>
<td style="width: 50px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['supplier_offer_id'] ?? '' }}</td>
<td style="width: 120px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['total'] ? number_format($offerPos['total'], 2, ',', '.') : "0,00" }} &euro;</td>