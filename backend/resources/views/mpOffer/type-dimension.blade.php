<td colspan="2" style="width: 180px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['name'] ?? '' }}</td>
<td style="width: 120px; height: 20px; text-align: left; margin-right: 5px;">
{{ $offerPos['mp_material'] ? $offerPos['mp_material']['name'] : '' }}</td>
<td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['price'] ? number_format($offerPos['price'], 2, ',', '.') : "0,00" }} &euro;</td>
<td style="width: 70px; height: 20px; text-align: right; margin-right: 5px;">
{{ number_format($offerPos['length'], 2, ',', '.') ?? 0 }}</td>
<td style="width: 70px; height: 20px; text-align: right; margin-right: 5px;">
{{ number_format($offerPos['width'], 2, ',', '.') ?? 0 }}</td>
<td style="width: 70px; height: 20px; text-align: right; margin-right: 5px;">
{{ number_format($offerPos['height'], 2, ',', '.') ?? 0 }}</td>
<td style="width: 90px; height: 20px; text-align: right; margin-right: 5px;">
{{ $offerPos['total'] ? number_format($offerPos['total'], 2, ',', '.') : "0,00" }} &euro;</td>