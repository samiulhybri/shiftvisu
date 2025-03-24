@if($certificate?->prod_order_pos_id_heat_treatment)
    <section class="body-content page-break-before">
        <span class="group-label" style="margin:15px 0 0 10px">{{__('messages.hweQs.Heat_treatment')}}</span>
        <table class="table-bordered">
            <thead>
            <tr>
                <th> {{__('messages.hweQs.Name')}}</th>
                <th> {{__('messages.hweQs.Quenching_Medium')}}</th>
                <th> {{__('messages.hweQs.Temperature_min')}}</th>
                <th> {{__('messages.hweQs.Temperature_max')}}</th>
                <th> {{__('messages.hweQs.Annealing_temperature')}}</th>
                <th> {{__('messages.hweQs.Heating_Time')}}</th>
                <th> {{__('messages.hweQs.Holding_Time')}}</th>
                <th> {{__('messages.hweQs.Cooldown_rate')}}</th>
            </tr>
            </thead>

            <tbody>
            @foreach($certificate?->heatTreatment->calculation?->operationPlan?->operationPlanPos ?? [] as $key=>$value)
                @if(count($value->operationPlanPosHeatTreatments))
                    <tr>
                        <th>{{$value->name ? __('messages.offerPosWorkPlanNameEnum.' .$value->name) : ''}}</th>
                        <th>{{$value->operationPlanPosHeatTreatments[0]->quenching_medium??''}}</th>
                        <th>{{$value->operationPlanPosHeatTreatments[0]->temperature_min??''}}</th>
                        <th>{{$value->operationPlanPosHeatTreatments[0]->temperature_max??''}}</th>
                        <th>{{$value->operationPlanPosHeatTreatments[0]->annealing_temperature??''}}</th>
                        <th>{{$value->operationPlanPosHeatTreatments[0]->heating_time??''}}</th>
                        <th>{{$value->operationPlanPosHeatTreatments[0]->holding_time??''}}</th>
                        <th>{{$value->operationPlanPosHeatTreatments[0]->cooldown_rate??''}}</th>
                    </tr>
                @endif
            @endforeach
            </tbody>

        </table>
    </section>


    <section class="body-content" style="">
        <span style=" color: #667085; font-size: 11px; padding: 10px">{{__('messages.hweQs.Note')}}:</span> <br>
        <span style=" color: #344054; font-size: 11px;padding: 10px">
              {{$certificate->note_heat_treatment}}
          </span>
    </section>
@endif
<section class="body-content {{$certificate?->prod_order_pos_id_heat_treatment ? '' : 'page-break-before'}}">
        <span class="group-label" style="margin:15px 0 0 10px">Ident</span>
        <table style="margin-left: -15px">
            <tr>
                <td class="label">{{__('messages.hweQs.Testing_in_order')}}</td>
                <td>:</td>
                <td class="value">{{$identIsOk? __('messages.hweQs.ok') : __('messages.hweQs.Not_ok')}}</td>
                <td class="label"></td>
                <td></td>
                <td class="value"></td>
            </tr>
        </table>

    </section>
    <section class="body-content">
        <span style=" color: #667085; font-size: 11px; padding: 10px">{{__('messages.hweQs.Attachment')}}:</span>
        <br>
        <span style=" color: #344054; font-size: 11px;padding: 10px">
              {{$certificate->note_attachment}}
          </span>
    </section>