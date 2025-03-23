<td style="width: 160px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['name'] ?? '' }}</td>
<td style="width: 10px; height: 20px; text-align: left; margin-right: 5px;"></td>
<td colspan="2" style="width: 220px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['supplier'] ? $offerPos['supplier']['name'] : '' }}</td>
<td colspan="4" style="width: 100px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['total'] ? number_format($offerPos['total'], 2, ',', '.') : "0,00" }} &euro;</td>