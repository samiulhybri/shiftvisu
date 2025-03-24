<td colspan="6" style="width: 200px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['name'] != '' ? $offerPos['name'] : '----' }}</td>
<td colspan="2" style="width: 100px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['total'] ? number_format($offerPos['total'], 2, ',', '.') : "0,00" }} &euro;</td>