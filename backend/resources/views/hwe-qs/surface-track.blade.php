<section class="body-content page-break-before">
        @if($certificate?->sample?->calculation?->calculationNonDestructiveTesting?->surface_crack_test_method =="MT" && $hweQsMt !=null)
        <span class="group-label"
              style="margin-left: 20px">{{__('messages.hweQs.Surface_track_inspection')}} </span>
        <table>
                <tr>
                    <td class="label">{{__('messages.hweQs.Specification')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt->specification}}</td>
                    <td class="label">{{__('messages.hweQs.Field_Strength_Meter')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsMt->field_strength_meter ? __('messages.mt_norm.' .$hweQsMt->field_strength_meter) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Revision')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt->revision}}</td>
                    <td class="label">{{__('messages.hweQs.UV_Meter')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsMt->uv_meter ? __('messages.mt_norm.' .$hweQsMt->uv_meter) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Test_Class')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt->test_class}}</td>
                    <td class="label">{{__('messages.hweQs.Magnetization')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsMt->magnetization ? __('messages.mt_norm.' .$hweQsMt->magnetization) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Registration_Limit')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt->registration_limit ? __('messages.mt_norm.' .$hweQsMt->registration_limit) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Current_Type')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsMt->current_type ? __('messages.mt_norm.' .$hweQsMt->current_type) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Test_Range')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt->test_range ? __('messages.mt_norm.' .$hweQsMt->test_range) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Illuminance')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsMt->illuminance ? __('messages.mt_norm.' .$hweQsMt->illuminance) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Testing_Facility')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt->testing_facility ? __('messages.mt_norm.' .$hweQsMt->testing_facility) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Irradiance')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsMt->irradiance ? __('messages.mt_norm.' .$hweQsMt->irradiance) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Test_Equipment')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt->test_equipment ? __('messages.mt_norm.' .$hweQsMt->test_equipment) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Residual_Magnetism')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsMt->residual_magnetism ? __('messages.mt_norm.' .$hweQsMt->residual_magnetism) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Uv_Lamp')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt->uv_lamp ? __('messages.mt_norm.' .$hweQsMt->uv_lamp) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Control_Unit')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsMt->control_unit ? __('messages.mt_norm.' .$hweQsMt->control_unit) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Lux_Meter')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt->lux_meter ? __('messages.mt_norm.' .$hweQsMt->lux_meter) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Comments')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsMt->comments }}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Testing_in_order')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsMt?->is_ok? __('messages.hweQs.ok') : __('messages.hweQs.Not_ok')}}</td>

                    <td class="label"></td>
                    <td></td>
                    <td class="value"></td>

                </tr>
            </table>

    @elseif($certificate?->sample?->calculation?->calculationNonDestructiveTesting?->surface_crack_test_method =="PT" && $hweQsPt !=null)
        <table>
                <tr>
                    <td class="label">{{__('messages.hweQs.Name')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsPt->name}}</td>
                    <td class="label">{{__('messages.hweQs.Penetrant')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->penetrant ? __('messages.pt_norm.' .$hweQsPt->penetrant) : ''}}</td>
                </tr>

                <tr>
                    <td class="label">{{__('messages.hweQs.Specification')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsPt->specification}}</td>
                    <td class="label">{{__('messages.hweQs.Batch_developer')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->batch_developer }}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Issue_Revision_Status')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsPt->issue_revision_status}}</td>
                    <td class="label">{{__('messages.hweQs.Batch_penetrant')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->batch_penetrant }}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Quality_Class')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsPt->quality_class}}</td>
                    <td class="label">{{__('messages.hweQs.Intermediate_Cleaner')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->intermediate_cleaner ? __('messages.pt_norm.' .$hweQsPt->intermediate_cleaner) : '' }}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Registration_Limit')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->registration_limit ? __('messages.pt_norm.' .$hweQsPt->registration_limit) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Cleaner')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->cleaner ? __('messages.pt_norm.' .$hweQsPt->cleaner) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Test_Scope')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->test_scope ? __('messages.pt_norm.' .$hweQsPt->test_scope) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Illuminance_Lux')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->illuminance_lux ? __('messages.pt_norm.' .$hweQsPt->illuminance_lux) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Test_Equipment')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt?->test_equipment ? __('messages.pt_norm.' .$hweQsPt->test_equipment) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Lux_Meter')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->lux_meter ? __('messages.pt_norm.' .$hweQsPt->lux_meter) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Test_Temperature')}}[°C]</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->test_temperature ? __('messages.pt_norm.' .$hweQsPt->test_temperature) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Control_Unit')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->control_unit ? __('messages.pt_norm.' .$hweQsPt->control_unit) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Developer')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->developer ? __('messages.pt_norm.' .$hweQsPt->developer) : ''}}</td>
                    <td class="label">{{__('messages.hweQs.Comments')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsPt->comments }}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Testing_in_order')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsPt?->is_ok? __('messages.hweQs.ok') : __('messages.hweQs.Not_ok')}}</td>

                    <td class="label"></td>
                    <td></td>
                    <td class="value"></td>

                </tr>

            </table>

    @elseif($certificate?->sample?->calculation?->calculationNonDestructiveTesting?->surface_crack_test_method =="VT" && $hweQsVt !=null)
        <table>
                <tr>
                    <td class="label">{{__('messages.hweQs.Name')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsVt->name}}</td>
                    <td class="label">{{__('messages.hweQs.Registration_Limit')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsVt->registration_limit ? __('messages.vt_norm.' .$hweQsVt->registration_limit) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Specification')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsVt->specification}}</td>
                    <td class="label">{{__('messages.hweQs.Test_Scope')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsVt->test_scope ? __('messages.vt_norm.' .$hweQsVt->test_scope) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Revision')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsVt->revision}}</td>
                    <td class="label">{{__('messages.hweQs.Illuminance')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsVt->illuminance ? __('messages.vt_norm.' .$hweQsVt->illuminance) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Quality_Class')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsVt->quality_class}}</td>
                    <td class="label">{{__('messages.hweQs.Lux_Meter')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsVt->lux_meter ? __('messages.vt_norm.' .$hweQsVt->lux_meter) : ''}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Surface_Quality')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsVt->surface_quality}}</td>
                    <td class="label">{{__('messages.hweQs.Comments')}}</td>
                    <td>:</td>
                    <td class="value">{{ $hweQsVt->comments}}</td>
                </tr>
                <tr>
                    <td class="label">{{__('messages.hweQs.Testing_in_order')}}</td>
                    <td>:</td>
                    <td class="value">{{$hweQsVt?->is_ok? __('messages.hweQs.ok') : __('messages.hweQs.Not_ok')}}</td>

                    <td class="label"></td>
                    <td></td>
                    <td class="value"></td>

                </tr>

            </table>

    @endif
    </section>
        <br>

        <section class="body-content" style="">
        <table>
            <tr>
                <td class="label">{{__('messages.hweQs.Examiner')}}</td>
                <td>:</td>
                <td class="value">{{$user?->name}}</td>
                <td class="label">{{__('messages.hweQs.Examiner_qualification')}}</td>
                <td>:</td>
                <td class="value">{{$user?->hwe_examiner_qualification}}</td>
            </tr>
        </table>
        <span style=" color: #667085; font-size: 11px; padding: 20px">{{__('messages.hweQs.Note')}}:</span> <br>
        <span style=" color: #344054; font-size: 11px;padding: 20px">
              {{$certificate->note_surface}}
          </span>
        <br>
    </section>