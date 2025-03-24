<td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['name'] ?? '' }}</td>
<td colspan="3" style="width: 220px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['pf_pm_type'] ? __('messages.mpOfferPdf.enums.'.$offerPos['pf_pm_type']) : '----' }}</td>
<td colspan="4" style="width: 100px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['total'] ? number_format($offerPos['total'], 2, ',', '.') : "0,00" }} &euro;</td>