*STATUS
20
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
*END
*WARNUNG
20
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
*END
*DATENSATZNAME
3
{{$customId}}	
0
0
*END
*MASCHINE
1
0
*END
*MATERIAL
10
{{$offerPos->material?->material_group_type ?? 'MATERIALGRUPPE_1'}} 					
{{$offerPos->material?->forging_temperature_max ?? 0.0}} 							
{{$offerPos->material?->forging_temperature_min ?? 0.0}}  							
{{$offerPos->material?->density ?? 0.0}} 							
{{
  $offerPos->material?->shrinkage == App\Enums\HweShrinkage::ONE_AND_HALF_PERCENT() 
    ? 1.5 
    : ($offerPos->material?->shrinkage == App\Enums\HweShrinkage::TWO_PERCENT()? 2 : 0.0) 
}}							
0
0
0
0
0
*END
*WALZFORMGEOMETRIE_KALT
10
{{$offerPos->offerPosRawDimensions[0]?->outer_diameter ?? 0}}		
{{$offerPos->offerPosRawDimensions[0]?->inner_diameter ?? 0}}		
{{$offerPos->offerPosRawDimensions[0]?->height ?? 0}}		
{{$offerPos->offerPosRawDimensions[0]?->radial_width ?? 0}}		
0
0
0
0
0
*END
*VORFORMBERECHNUNGSDATEN
20
0
{{$offerPos->offerPosRawDimensions[0]?->rolling_pin ?? 0}}
0
{{$offerPos->offerPosRawDimensions[0]?->height_pre_1 ?? 0}}
{{$offerPos->offerPosRawDimensions[0]?->inner_diameter_pre_1 ?? 0}}
0.0
0.0
0.0
0.0
0.0
0.0
0.0
0.0
0.0
0.0
0.0
0.0
0.0
0.0
0.0
*END
*PROZESSDATEN
10
0
0
0
1
0
0
0
0
0
0
*END
