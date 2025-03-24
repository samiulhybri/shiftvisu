<section class="body-content page-break-before">
        <span class="group-label" style="margin-left: 20px">Ultrasonic documentation</span>
        <table>
            <tr>
                <td class="label">{{__('messages.hweQs.Specification')}}</td>
                <td>:</td>
                <td class="value">{{$hweQsUs?->specification}}</td>
                <td class="label">{{__('messages.hweQs.Coupling')}}</td>
                <td>:</td>
                <td class="value">{{ $hweQsUs?->coupling ? __('messages.couplingEnum.' .$hweQsUs->coupling) : ''}}</td>
            </tr>
            <tr>
                <td class="label">{{__('messages.hweQs.Issue')}}</td>
                <td>:</td>
                <td class="value">{{$hweQsUs?->issue}}</td>
                <td class="label">{{__('messages.hweQs.Amplification')}}</td>
                <td>:</td>
                <td class="value">{{$hweQsUs?->amplification ? __('messages.amplificationEnum.' .$hweQsUs->amplification) : ''}}</td>

            </tr>
            <tr>
                <td class="label"> {{__('messages.hweQs.Quality_Class')}}</td>
                <td>:</td>
                <td class="value">{{$hweQsUs?->quality_class}}</td>

                <td class="label">{{__('messages.hweQs.Residual_Magnetism')}}</td>
                <td>:</td>
                <td class="value"> {{$hweQsUs?->residual_magnetism}}</td>

            </tr>
            <tr>
                <td class="label">{{__('messages.hweQs.Surface_Finish')}}</td>
                <td>:</td>
                <td class="value">{{$hweQsUs?->surface_finish ? __('messages.surfaceFinishEnum.' .$hweQsUs->surface_finish) : ''}}</td>
            </tr>
            <tr>
                <td class="label">{{__('messages.hweQs.Testing_in_order')}}</td>
                <td>:</td>
                <td class="value">{{$hweQsUs?->is_ok? __('messages.hweQs.ok') : __('messages.hweQs.Not_ok')}}</td>
                <td class="label"></td>
                <td></td>
                <td class="value"></td>
            </tr>
        </table>
        <span class="group-label" style="margin-left: 15px">{{__('messages.hweQs.Test_Scopes')}}</span>
        <table class="table-bordered">

            <thead>
            <tr>
                <th>{{__('messages.hweQs.Test_Scope')}}</th>
                <th> {{__('messages.hweQs.Probe')}}</th>
                <th> {{__('messages.hweQs.Test_Direction')}}</th>
                <th> {{__('messages.hweQs.Sound_Attenuation')}}</th>
            </tr>
            </thead>

            <tbody>
            @foreach($hweQsUs?->usNormTestScopes ?? [] as $key=>$usNormTestScope)
                <tr>
                    <th>{{$usNormTestScope->test_scope}}</th>
                    <th> {{$usNormTestScope->probe ? __('messages.probeEnum.'.$usNormTestScope->probe) :'' }}</th>
                    <th> {{$usNormTestScope->test_direction ? __('messages.testDirectionEnum.'.$usNormTestScope->test_direction) :'' }}</th>
                    <th> {{$usNormTestScope->sound_attenuation_operator ? __('messages.operatorEnum.'.$usNormTestScope->sound_attenuation_operator) :'' }} {{$usNormTestScope->sound_attenuation}}</th>
                </tr>
            @endforeach
            </tbody>

        </table>
        <span class="group-label" style="margin-left: 15px">{{__('messages.hweQs.Test_Sections')}}</span>
        <table class="table-bordered">

            <thead>
            <tr>
                <th>{{__('messages.hweQs.Test_Section')}}</th>
                <th> {{__('messages.hweQs.Registration_Threshold')}}</th>
                <th> {{__('messages.hweQs.Reporting_Threshold')}}</th>
            </tr>
            </thead>

            <tbody>
            @foreach($hweQsUs?->usNormTestSections ?? [] as $key=>$usNormTestSections)
                <tr>
                    <th>{{$usNormTestSections->test_section}}</th>
                    <th> {{$usNormTestSections->registration_threshold_operator ? __('messages.operatorEnum.'.$usNormTestSections->registration_threshold_operator):''}}
                        {{$usNormTestSections->registration_threshold}}</th>
                    <th> {{$usNormTestSections->reporting_threshold_operator ? __('messages.operatorEnum.'.$usNormTestSections->reporting_threshold_operator):''}}
                        {{$usNormTestSections->reporting_threshold}}</th>
                </tr>
            @endforeach
            </tbody>

        </table>


    </section>
        <section class="body-content" style="">
        <table>
            <td class="label">{{__('messages.hweQs.Examiner')}}</td>
            <td>:</td>
            <td class="value">{{$user?->name}}</td>
            <td class="label">{{__('messages.hweQs.Examiner_qualification')}}</td>
            <td>:</td>
            <td class="value">
                {{$user?->hwe_examiner_qualification}}
            </td>
            <td class="label">{{__('messages.hweQs.Test_Device')}} </td>
            <td>:</td>
            <td class="value"> {{$hweQsUs?->test_device ? __('messages.test_device.'.$hweQsUs?->test_device):''}}</td>
        </table>
        <span style=" color: #667085; font-size: 11px; padding: 10px">Note Ultrasonic:</span> <br>
        <span style=" color: #344054; font-size: 11px;padding: 10px">
              {{$certificate->note_ultrasonic}}
          </span>
    </section>