{{__('messages.hweQs.company')}};Hammerwerk Erft G. Diederichs GmbH & Co. KG;
{{__('messages.hweQs.Certificate_date')}};{{now()->format('d.m.Y')}};
{{__('messages.hweQs.certificateNo')}};{{$certificate?->sample?->prodOrder?->custom_id}}-Rev{{$certificate->rev}};
@if ($melt?->item?->hweClassificationGiesstyp?->value_string == "B")
{{__('messages.hweQs.materialType')}};{{ __('messages.hweQs.Block_casting') }};
@elseif ($melt?->item?->hweClassificationGiesstyp[0]?->value_string == "S")
{{__('messages.hweQs.materialType')}};{{ __('messages.hweQs.Continuous_casting') }};
@endif
{{__('messages.hweQs.sampleNo')}};{{ $hweCertificateHweQsSample?->hweQsSample?->custom_id ?? '' }};
{{ __('messages.hweQs.Material_no') }}; {{ $certificate->sample?->calculation?->offerPos?->customer_material_number ?? '' }};
{{ __('messages.hweQs.testNo') }};{{$certificate->inspection_no}};

{{__('messages.hweQs.orderNo')}};{{ $certificate?->sample?->salesOrderPos?->salesOrders?->customer_reference }};
{{ __('messages.hweQs.Order_item') }};{{$certificate?->sample?->salesOrderPos?->customer_reference}};
{{__('messages.hweQs.Quantity')}};{{$certificate?->sample?->quantity}};
{{__('messages.hweQs.Item_Name')}};{{$certificate?->sample?->calculation?->offerPos?->item_name}}; //
{{ __('messages.hweQs.orderSpecification') }};{{$certificate->sample?->calculation?->testingScope?->custom_id}};
{{__('messages.hweQs.Heat_No')}};{{$bomPos?->melt?->value_string}};
{{ __('messages.hweQs.Material_no') }};{{ $certificate->sample?->calculation?->offerPos?->material?->custom_id . '  ' . $certificate->sample?->calculation?->offerPos?->material?->name }};
{{ __('messages.hweQs.Material_no') }};{{$certificate->sample?->calculation?->offerPos?->customer_material_number}};

{{ __('messages.hweQs.FPP_Revision') }};{{$certificate->sample?->calculation?->calculationDocumentation?->fpp_rev}};
{{ __('messages.hweQs.FPP_Rev') }};{{$certificate->sample?->calculation?->calculationDocumentation?->fpp_nr}}
{{ __('messages.hweQs.Prozessroute') }};{{$certificate->sample?->calculation?->calculationDocumentation?->process_route}};
{{ __('messages.hweQs.Heat_Treatment') }};860ø C /  8 h / Wasser-water + 680ø C / 12 h / Luft-air;
@foreach($elements as $element)
@if(isset($melt) && ($melt["element_{$element}"]))
{{ $elData[$element] }};{{  $melt["element_{$element}"] }};{{ $element == 'b' ? 'ppm' : '%' }}
@endif
@endforeach
@if(isset($melt) && ($melt["element_ai"] && $melt["element_n"]))
Ai/N;{{  number_format($melt["element_ai"]/$melt["element_n"],2) }};%'
@endif

{{ __("messages.hweQs.grainSize") }};{{ $melt?->grain_size_value_hwe }};

@foreach($purities as $purity)
{{ __('messages.hweQs.Material_no') }} {{ $purityData[$purity] }};@if($purity!=='ds'){{ $melt["fine_{$purity}"]?? ''  }};@else{{ $melt["{$purity}"] ?? '' }}@endif{{  $melt["thick_{$purity}"] ?? '' }};
@endforeach
@foreach($purities as $purity)
{{ __('messages.hweQs.Purity_thick') }} {{ $purityData[$purity] }};@if($purity!=='ds'){{ $melt["thick_{$purity}"]?? ''  }};@else{{ $melt["{$purity}"] ?? '' }}@endif{{  $melt["thick_{$purity}"] ?? '' }};
@endforeach
@if($melt)
@foreach($variants as $key=>$variant)
@if(($melt["j_{$variant}_sw"]) && in_array($variant, $setVariant))
{{ __('messages.hweQs.Jominy') }}{{ $variant =='1_5' ? __('messages.hweQs.1_5') : $variant}}mm;{{  $melt["j_{$variant}_sw"]}};HRC
@endif
@endforeach
@endif

{{ __('messages.hweQs.Sample') }};{{$hweQsTensileTest?->prodOrderPos?->calculation?->testingScope?->specimen_location ? __('messages.specimenLocationEnum.'.$hweQsTensileTest->prodOrderPos?->calculation?->testingScope?->specimen_location):''}}
{{ __('messages.hweQs.Sample') }}; BHP;{{$hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope?->bhp_dimension? str_replace("_", "", $hweQsTensileTest->prodOrderPos?->calculation?->testingScope?->bhp_dimension): ''}};mm
{{ __('messages.hweQs.Hardness') }};{{$hweQsHb?->hweQsHbPos[0]?->value??''}};HB;
{{__('messages.hweQs.Yield_point')}};{{$hweQsTensileTest?->reh}};MPa;
{{__('messages.hweQs.Tensile_Strength')}};{{$hweQsTensileTest?->rm}};
{{__('messages.hweQs.Elongation')}};{{$hweQsTensileTest?->a5}};
{{__('messages.hweQs.Reduction_Of_Area')}};{{$hweQsTensileTest?->z}};
Reduction of degree;10,2;						Reduction of degree		????? (Verschmiedungsgrad)
@php
	$data = $hweQsImpactTest?->hweQsImpactTestPos?->first();
@endphp
{{__('messages.hweQs.notchImpactValue')}} {{$data->value_1?? ''}};
{{__('messages.hweQs.notchImpactValue')}} {{$data->value_2??''}};
{{__('messages.hweQs.notchImpactValue')}} {{$data->value_3??''}};
@if($melt)
@for($i=1; $i<=18;$i++ )
@if(isset($melt) && ($melt["class_{$i}"]))
@if($i==18)
KG_{{$i}};{{ $melt["class_{$i}"]}};%
@else
KG_{{$i}}-{{$i+1}};{{ $melt["class_{$i}"]}};%
@endif
@endif
@endfor
@endif
@foreach($elements as $element)
@if(isset($melt) && ($melt["element_{$element}_hwe"]))
ST_{{$elData[$element] }};{{  $melt["element_{$element}_hwe"] }};{{ $element == 'b' ? 'ppm' : '%' }}
@endif
@endforeach

