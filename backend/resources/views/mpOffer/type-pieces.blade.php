<td style="width: 180px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['name'] ?? '' }}</td>
<td colspan="2" style="text-align: left; width: 100px; height: 20px; margin-right: 5px;">{{ $offerPos['note'] ?? '' }}</td>
<td style="text-align: center; width: 20px; height: 20px; margin-right: 5px;">
{{ __('messages.mpOfferPdf.mainContent.qty') }}</td>
<td style="text-align: left; width: 60px; height: 20px; margin-right: 5px;">
{{ number_format($offerPos['quantity'], 0, ',', '.') ?? 0 }}</td>
<td style="text-align: left; width: 80px; height: 20px; margin-right: 5px;">
{{ __('messages.mpOfferPdf.mainContent.cost') }} CAD</td>
<td style="width: 100px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['price'] ? number_format($offerPos['price'], 2, ',', '.') : "0,00" }} &euro;</td>
<td style="width: 100px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['total'] ? number_format($offerPos['total'], 2, ',', '.') : "0,00" }} &euro;</td>