<!doctype html>
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{__('messages.trip.furnaceTrips')}}</title>
    <style type="text/css">
        @font-face {
            font-family: Arial;
            font-size: normal;
            font-weight: normal;
            src: url('{{ storage_path("fonts/arialmt.ttf") }}') format('truetype');
        }

        body {
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 8px;
            font-weight: 400;
            line-height: 15px;
            font-style: normal;
        }

        table {
            width: 100%;
        }

        .tas {
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        table,
        th,
        td {
            border: 1px solid black;
        }
    </style>
</head>

<body>
    <div style="display:flex; flex-direction:column;">
        <div style="display:flex;flex-direction:row;justify-content:center;align-items: center;width:100%;">
            <h2 style="align-self:center;text-align:center;">{{__('messages.trip.furnaceTrips')}}</h2>
        </div>
        <div style="width: 100%;height:1px;background-color: grey; ">
        </div>


        <table style="border-bottom: 2px solid rgb(0, 0, 0, 0.5);margin-bottom:20px">
            <tr style="width: 300px; border:1px red solid;">
                <th class="tas">{{__('messages.trip.furnaceTrip')}}</th>
                <th class="tas">{{__('messages.trip.orderNumber')}}</th>
                <!-- <th class="tas">{{__('messages.trip.statDateSap')}}</th> -->
                <th class="tas">{{__('messages.trip.prodDate')}}</th>
                <!-- <th class="tas">{{__('messages.trip.ovenGroup')}}</th> -->
                <!-- <th class="tas">{{__('messages.trip.ovenNumber')}}</th> -->
                <th class="tas">{{__('messages.trip.ovenName')}}</th>
                <!-- <th class="tas">{{__('messages.trip.operationNumber')}}</th> -->
                <th class="tas">{{__('messages.trip.operation')}}</th>
                <th class="tas">{{__('messages.trip.product')}}</th>
                <!-- <th class="tas">{{__('messages.trip.productType')}}</th> -->
                <th class="tas">{{__('messages.trip.quantity')}}</th>
                <th class="tas">{{__('messages.trip.material')}}</th>
                <th class="tas">{{__('messages.trip.materialType')}}</th>
                <th class="tas">{{__('messages.trip.linkedOrders')}}</th>
                <th class="tas">{{__('messages.trip.quenchingMedium')}}</th>
                <th class="tas">{{__('messages.trip.hardness')}}</th>
                <th class="tas">{{__('messages.trip.temMin')}}</th>
                <th class="tas">{{__('messages.trip.temMax')}}</th>
                <th class="tas">{{__('messages.trip.annealingTemperature')}}</th>
                <th class="tas">{{__('messages.trip.heatingTime')}}</th>
                <th class="tas">{{__('messages.trip.holdingTime')}}</th>
                <th class="tas">{{__('messages.trip.cooldownRate')}}</th>
                <th class="tas">{{__('messages.trip.crossSection')}}</th>
                <th class="tas">{{__('messages.trip.internalNote')}}</th>
            </tr>
            @foreach($data as $prodOrderPosOperation)
                                    @php
                $opPos = null;

                if (!empty($prodOrderPosOperation['prodOrderPos']['calculation']['operationPlan']['operationPlanPos'])) {
                    foreach ($prodOrderPosOperation['prodOrderPos']['calculation']['operationPlan']['operationPlanPos'] as $operationPlanPos) {
                        if ($operationPlanPos->pos == $prodOrderPosOperation['pos']) {
                            $opPos = $operationPlanPos;
                            break;
                        }
                    }
                }
                                    @endphp
                                    <tr>
                                        <td>{{$prodOrderPosOperation['prodLot']['custom_id'] ?? ''}}</td>
                                        <td>{{$prodOrderPosOperation['prodOrderPos']['prodOrder']['custom_id'] ?? ''}}</td>
                                        <td>{{date('M d, Y', strtotime($prodOrderPosOperation['start']))}}</td>
                                        <!-- <td>{{date('M d, Y h:i a', strtotime($prodOrderPosOperation['prodLot']['start']))}}</td> -->
                                        <!-- <td>{{$prodOrderPosOperation['prodLot']['machine']['machineGroup']['name'] ?? ''}}</td> -->
                                        <!-- <td>{{$prodOrderPosOperation['prodLot']['machine']['custom_id'] ?? ''}}</td> -->
                                        <td>{{$prodOrderPosOperation['prodLot']['machine']['name'] ?? ''}}</td>
                                        <!-- <td>{{$prodOrderPosOperation['pos']}}</td> -->
                                        <td >{{\Illuminate\Support\Str::limit($prodOrderPosOperation['name'],15)}}</td>
                                        <td>{{$prodOrderPosOperation['prodOrderPos']['item']['name'] ?? ''}}</td>
                                        <!-- <td>{{$prodOrderPosOperation['prodOrderPos']['calculation']['offerPos']['product_type'] ?? ''}}</td> -->
                                        <td>{{$prodOrderPosOperation['prodOrderPos']['quantity'] ?? '0'}}</td>
                                        <td>{{$prodOrderPosOperation['prodOrderPos']['calculation']['offerPos']['material']['name'] ?? ''}}</td>
                                        <td>{{$prodOrderPosOperation['prodOrderPos']['calculation']['offerPos']['material']['material_group_type'] ?? ''}}
                                        </td>
                                        <td>{{$prodOrderPosOperation['prodOrderPos']['calculation']['note_linked_operations'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['quenching_medium'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['hardness'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['temperature_min'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['temperature_max'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['annealing_temperature'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['heating_time'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['holding_time'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['cooldown_rate'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['cross_section'] ?? ''}}</td>
                                        <td>{{$opPos['operationPlanPosHeatTreatments'][0]['internal_note'] ?? ''}}</td>
                                    </tr>
            @endforeach
        </table>
    </div>
    <div class="footer margin-top">