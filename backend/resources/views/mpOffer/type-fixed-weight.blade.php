<td colspan="3" style="width: 150px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['name'] ?? '' }}</td>
<td style="text-align: center; width: 30px; height: 20px; margin-right: 5px;">KG</td>
<td style="text-align: left; width: 65px; height: 20px; margin-right: 5px;">
{{ number_format($offerPos['quantity'], 0, '', '.') ?? 0 }}</td>
<td style="text-align: right; width: 80px; height: 20px; margin-right: 5px;">
{{ __('messages.mpOfferPdf.mainContent.costPer') }} KG</td>
<td style="width: 75px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['price'] ? number_format($offerPos['price'], 2, ',', '.') : "0,00" }} &euro;</td>
<td style="width: 120px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['total'] ? number_format($offerPos['total'], 2, ',', '.') : "0,00" }} &euro;</td>