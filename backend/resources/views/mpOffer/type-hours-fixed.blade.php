<td style="width: 180px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['name'] ?? '' }}</td>
<td colspan="2" style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['machine'] && $offerPos['showMachineName'] == true ? $offerPos['machine']['name'] : '' }}</td>
<td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">
{{ number_format($offerPos['personnel_quantity'], 0, ',', '.') ?? 0 }}</td>
<td style="width: 60px; height: 20px; text-align: right; margin-right: 5px;">----</td>
<td style="width: 88px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['personnel_price'] ? number_format($offerPos['personnel_price'], 2, ',', '.') : "0,00" }} &euro;</td>
<td style="width: 88px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['machine_price'] ? number_format($offerPos['machine_price'], 2, ',', '.') : "0,00" }} &euro;</td>
<td style="width: 88px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['total'] ? number_format($offerPos['total'], 2, ',', '.') : "0,00" }} &euro;</td>