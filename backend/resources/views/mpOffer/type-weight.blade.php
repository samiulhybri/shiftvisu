<td style="width: 195px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['name'] ?? '' }}</td>
<td colspan="2" style="width: 90px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['supplier'] ? $offerPos['supplier']['name'] : '' }}</td>
<td style="width: 50px; height: 20px; text-align: center; margin-right: 5px;">KG</td>
<td style="width: 60px; height: 20px; text-align: left; margin-right: 5px;">
{{ number_format($offerPos['quantity'], 0, ',', '.') ?? 0 }}</td>
<td style="text-align: center; width: 80px; height: 20px; margin-right: 5px;">
{{ __('messages.mpOfferPdf.mainContent.costPer') }} KG</td>
<td style="width: 75px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['price'] ? number_format($offerPos['price'], 2, ',', '.') : "0,00" }} &euro;</td>
<td style="width: 100px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['total'] ? number_format($offerPos['total'], 2, ',', '.') : "0,00" }} &euro;</td>