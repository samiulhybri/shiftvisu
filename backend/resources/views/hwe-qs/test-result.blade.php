@if($hweQsTensileTest)
    <section class="body-content page-break-before" style="height: 350px">
            <span class="group-label" style="margin-left: 20px">{{__('messages.hweQs.Test_Results')}}</span>
            <table>
                <tr>
                    <td class="label">{{ __('messages.hweQs.samplePosition') }}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsTensileTest?->prodOrderPos?->calculation?->testingScope?->specimen_location ? __('messages.specimenLocationEnum.'.$hweQsTensileTest->prodOrderPos?->calculation?->testingScope?->specimen_location):''}}</td>

                </tr>
                <tr>
                    <td class="label">{{ __('messages.hweQs.TensileTestAccordingTo') }}</td>
                    <td>:</td>
                    <td class="value">
                        @php
                            $data = $hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope?->accordingToTensileTests;

                            $data = $data?->pluck('according_to_tensile_test')?->map(function ($value) {
                                return trans('messages.accordingToTensileTestsEnum.' . $value);
                            })?->implode(', ') ?? '';
                            echo $data;
                        @endphp
                    </td>
                    <td class="label">{{ __('messages.hweQs.impactTestAccordingTo') }}</td>
                    <td>:</td>
                    <td class="value">

                        @php
                            $data = $hweQsImpactTest?->prodOrderPos?->calculation?->calculationTestingScope?->accordingToImpactTests;

                            $data = $data?->pluck('according_to_impact_test')?->map(function ($value) {
                                 return trans('messages.testingScopeAccordingToImpactTestEnum.' . $value);
                             })?->implode(', ') ?? '';
                             echo $data;
                        @endphp


                    </td>
                </tr>
                <tr>
                    <td class="label">{{ __('messages.hweQs.SpecimenDimension') }} [mm]</td>
                    <td>:</td>
                    <td class="value">{{$hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope?->specimen_dimension ? __('messages.specimenDimensionEnum.'.$hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope?->specimen_dimension):''}}</td>
                </tr>
                <tr>
                    <td class="label">{{ __('messages.hweQs.Blind_hardness_test') }} [mm]</td>
                    <td>:</td>
                    <td class="value">{{$hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope?->bhp_dimension? str_replace("_", "", $hweQsTensileTest->prodOrderPos?->calculation?->testingScope?->bhp_dimension): ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Testing_in_order')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsTensileTest?->is_ok? __('messages.hweQs.ok') : __('messages.hweQs.Not_ok')}}</td>

                    <td class="label">{{__('messages.hweQs.Testing_in_order')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsImpactTest?->is_ok? __('messages.hweQs.ok') : __('messages.hweQs.Not_ok')}}</td>

                </tr>
            </table>

            <div class="test-result" style="margin-top: -10px">
                <div class="test-result-table">
                    <table class="impact-test-table">
                        <tr>
                            <th></th>
                            <th>{{__('messages.hweQs.Soll')}}</th>
                            <th>{{__('messages.hweQs.Ist')}}</th>
                        </tr>
                        <tr>
                            <td>{{__('messages.hweQs.Yield_point')}} [MPa]</td>
                            <td>{{$hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope?->reh_min}}</td>
                            <td>{{$hweQsTensileTest?->reh}}</td>
                        </tr>
                        <tr>
                            <td>{{__('messages.hweQs.Tensile_Strength')}} [MPa]</td>
                            <td>{{$hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope?->rm_min}}</td>
                            <td>{{$hweQsTensileTest?->rm}}</td>
                        </tr>
                        <tr>
                            <td>{{__('messages.hweQs.Elongation')}} [%]</td>
                            <td>{{$hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope?->a5_min}}</td>
                            <td>{{$hweQsTensileTest?->a5}}</td>
                        </tr>
                        <tr>
                            <td>{{__('messages.hweQs.Reduction_Of_Area')}} [%]</td>
                            <td>{{$hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope?->z_min}}</td>
                            <td>{{$hweQsTensileTest?->z}}</td>
                        </tr>
                        <tr>
                            <td>{{__('messages.hweQs.Test_Temperature')}} [°C]</td>
                            <td colspan="2">
                                @php
                                    $testTemperature = [];

                                    $calculationTestingScope = $hweQsTensileTest?->prodOrderPos?->calculation?->calculationTestingScope;

                                    if ($calculationTestingScope) {
                                        $testTemperature[] = $calculationTestingScope->zug > 0 ? "RT" : null;
                                        $testTemperature[] = $calculationTestingScope->zug_gt_40 ? ">40 °C" : null;
                                        $testTemperature[] = $calculationTestingScope->zug_300 ? "300 °C" : null;

                                        $testTemperature = array_filter($testTemperature);
                                    }

                                    $testTemperatureString = implode(', ', $testTemperature);
                                    echo $testTemperatureString;
                                @endphp

                            </td>

                        </tr>
                    </table>
                </div>
                <div class="test-result-table" style="float: right;">
                    <table class="impact-test-table">
                        <tr>
                            <th></th>
                            <th>{{__('messages.hweQs.Soll')}}</th>
                            <th>{{__('messages.hweQs.Ist')}}</th>
                        </tr>
                        <tr>
                            <td>{{__('messages.hweQs.Notch_Impact_Value')}}</td>
                            <td>{{$hweQsImpactTest?->prodOrderPos?->calculation?->calculationTestingScope?->toughness}}</td>
                            <td>
                                @php
                                    $data = $hweQsImpactTest?->hweQsImpactTestPos->first();

                                   $data = $data ? "$data->value_1/$data->value_2/$data->value_3"  : '';
                                   echo $data;
                                @endphp
                            </td>
                        </tr>
                        <tr>
                            <td>{{__('messages.hweQs.Notch_Impact_Value')}}</td>
                            <td>{{$hweQsImpactTest?->prodOrderPos?->calculation?->calculationTestingScope?->impact_energy_av}}</td>
                            <td>
                                @php
                                    $data = $hweQsImpactTest?->hweQsImpactTestPos->first();

                                   $data = $data ? ($data->value_1+$data->value_2+$data->value_3)/3  : '';
                                   echo $data ? number_format($data, 2): null;
                                @endphp
                            </td>
                        </tr>
                        <tr>
                            <td>{{__('messages.hweQs.Test_Temperature')}} [°C]</td>
                            <td colspan="2"> @php
                                    $data = $hweQsImpactTest?->hweQsImpactTestPos->first();

                                   $data = $data ? "$data->temperature"  : '';
                                   echo $data;
                                @endphp</td>

                        </tr>
                    </table>
                </div>
            </div>
        </section>
    <section class="body-content" style="">
            <span style=" color: #667085; font-size: 11px; padding: 10px">{{__('messages.hweQs.Note_test_result')}}:</span>
            <br>
            <span style=" color: #344054; font-size: 11px;padding: 10px">
              {{$certificate->test_result_note}}
          </span>
        </section>
@endif
@if($hweQsImpactTest)
    <section class="body-content {{$hweQsTensileTest ==null ? ' page-break-before' :'' }}">
            <span class="group-label" style="margin-left: 20px">{{__('messages.hweQs.Hardness_Testing')}} </span>
            <table>

                <tr>
                    <td class="label">{{__('messages.hweQs.Harteprufung_nach')}}</td>
                    <td>:</td>
                    <td class="value">Brinell</td>
                    <td class="label"></td>
                    <td></td>
                    <td class="value"></td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Sollwert_min')}}. [MPa]</td>
                    <td>:</td>
                    <td class="value">{{$hweQsHb?->prodOrderPos?->calculation?->calculationTestingScope?->min_hbw_on_the_component}}</td>
                    <td class="label"></td>
                    <td></td>
                    <td class="value"></td>
                </tr>
                <tr>
                    <td class="label"> {{__('messages.hweQs.Sollwert_max')}}. [MPa]</td>
                    <td>:</td>
                    <td class="value">{{$hweQsHb?->prodOrderPos?->calculation?->calculationTestingScope?->max_hbw_on_the_component}}</td>
                    <td class="label"></td>
                    <td></td>
                    <td class="value"></td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Testing_in_order')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsHb?->is_ok? __('messages.hweQs.ok') : __('messages.hweQs.Not_ok')}}</td>

                    <td class="label"></td>
                    <td></td>
                    <td class="value"></td>

                </tr>
            </table>
            <table class="table-bordered">

                <thead>
                <tr>
                    <th>{{__('messages.hweQs.serial')}}</th>
                    <th> {{__('messages.hweQs.position')}}</th>
                    <th> {{__('messages.hweQs.measurement')}}</th>
                    <th> {{__('messages.hweQs.checkpoint')}}</th>
                    <th> {{__('messages.hweQs.value')}}</th>
                </tr>
                </thead>

                <tbody>
                @foreach($hweQsHb?->hweQsHbPos ?? [] as $key=>$value)
                    <tr>
                        <th>{{$value->serial}}</th>
                        <th>{{$value->position? __('messages.position.'.$value->position): ''}}</th>
                        <th>{{$value->measurement}}</th>
                        <th>{{$value->checkpoint}}</th>
                        <th>{{$value->value}}</th>

                    </tr>
                @endforeach
                </tbody>

            </table>
        </section>
    <section class="body-content" style="">
            <span style=" color: #667085; font-size: 11px; padding: 10px">Note Hardness testing:</span> <br>
            <span style=" color: #344054; font-size: 11px;padding: 10px">
              {{$certificate->hardness_note}}
          </span>
        </section>
@endif