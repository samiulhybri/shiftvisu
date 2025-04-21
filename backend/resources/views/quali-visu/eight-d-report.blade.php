<!doctype html>
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ __('messages.eightDReport.eightDReport') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">

    <style type="text/css">
        body {
            font-family: 'Poppins';
            font-weight: 400;
        }

        table {
            width: 100%;
            border-spacing: 0;
            border-collapse: collapse;
        }

        td {
            padding-left: 5px;
            padding-bottom: 5px;
            padding-right: 5px;
            color: #005981;
            font-size: 12px;
        }

        td>div {
            line-height: 10px;
        }

        .black {
            color: #1D2D3E;
        }

        .black-border {
            border: 1px solid #1D2D3E8F;
        }

        footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 12px;
        }

        @page {
            margin: 0;
            margin-bottom: 20px;
            size: A4;
        }
    </style>
</head>

<body
    style="background: url({{ public_path('images/eight-d-report-background.png') }}) no-repeat;   background-position: left top; background-size: 70%; padding: 20px">
    <table>
        <tr>
            <td class="w-half" style="width: 100%">
                <div style="font-size: x-large; font-weight: 600; color: #1D2D3E">
                    {{__('messages.eightDReport.eightDReport')}}
                </div>
            </td>
            <td style="text-align: right, width: 50%">
                <img src="{{ public_path('images/company-blue-logo.jpg') }}" alt="schertech-logo" width="200" />
            </td>
        </tr>
    </table>
    <hr>

    <div>
        <div style="font-size: larger; font-weight: 700;" class="black">1. {{__('messages.eightDReport.generalInfo')}}
        </div>
        <div>
            <table style="width: 100%" border="1">
                <tr>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.concernTitle')}}
                        </div>
                        <div>
                            {{ $report->title }}
                        </div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.complainNumber')}}
                        </div>

                        <div>{{ $report->complaint_no }}</div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.supplier')}}
                        </div>
                        <div>{{ $report->supplier?->name }}</div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.productionSite')}}
                        </div>
                        <div>{{ $report->production?->name }}</div>

                    </td>
                </tr>

                <tr>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.drawingNo')}}
                        </div>

                        <div>{{ $report->drawing_no }}</div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.drawingRevision')}}
                        </div>

                        <div>{{ $report->drawing_revision }}</div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.plants')}}
                        </div>

                        <div>{{ $report->plant?->name }}</div>

                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.quantityDelivery')}}
                        </div>

                        <div>{{ $report->quantity_delivered }}</div>
                    </td>
                </tr>

                <tr>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.partName')}}
                        </div>
                        @if ($report->drawing_no)
                            <div>{{ $report->part_name }}</div>
                        @else
                            <br>
                        @endif
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.revision')}}
                        </div>
                        <div>{{ $report->revision }}</div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.openingDate')}}
                        </div>
                        @if ($report->complaint_opening_date)
                            <div>{{date('d.m.Y', strtotime($report->complaint_opening_date))}}</div>
                        @endif
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600;" class="black">
                            {{__('messages.eightDReport.revisionDate')}}
                        </div>
                        @if ($report->revision_date)
                            <div>{{date('d.m.Y', strtotime($report->revision_date))}}</div>
                        @endif
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div style="page-break-inside: avoid;">
        <div style="font-size: larger; font-weight: 700;" class="black">{{__('messages.eightDReport.team')}}</div>
        <div>
            <table style="width: 100%; vertical-align: top;" border="1">
                <tr>
                    <td style="width: 50%; margin: 0; vertical-align: top;">
                        <table border="0">
                            <tr>
                                <td style="width: 115px; font-weight: 600; font-size: 14px; padding-left: 0; padding-bottom: 5px; padding-top: 0; vertical-align: top;"
                                    class="black">
                                    <div>{{__('messages.eightDReport.members')}}</div>
                                </td>

                                <td style="width: 115px; font-weight: 600; font-size: 14px; padding-left: 0; padding-bottom: 5px; padding-top: 0; vertical-align: top;"
                                    class="black">
                                    <div>{{__('messages.eightDReport.department')}}</div>
                                </td>

                                <td style="width: 115px; font-weight: 600; font-size: 14px; padding-left: 0; padding-right: 0; padding-bottom: 5px; padding-top: 0; vertical-align: top;"
                                    class="black">
                                    <div>{{__('messages.eightDReport.email')}}</div>
                                </td>
                            </tr>
                            @foreach ($report->team as $index => $member)
                                @if($index > 0)
                                    <tr>
                                        <td
                                            style="width: 115px; word-wrap: break-word; padding-left: 0; padding-bottom: 5px; vertical-align: top;">
                                            <div>{{ $member->name }}</div>
                                        </td>
                                        <td
                                            style="width: 115px; word-wrap: break-word; padding-left: 0; padding-bottom: 5px; vertical-align: top;">
                                            @if ($member->userGroup->count())
                                                <div>{{ $member->userGroup[0]->name }}</div>
                                            @endif
                                        </td>

                                        <td
                                            style="width: 115px; word-wrap: break-word; padding-left: 0; padding-right: 0; padding-bottom: 5px; vertical-align: top;">
                                            <div>{{ $member->email }}</div>
                                        </td>
                                    </tr>
                                @endif
                            @endforeach
                            <tr></tr>

                            @if($report->team->count())
                                <tr>
                                    <td style="width: 115px; font-weight: 600; font-size: 14px; padding-left: 0; padding-bottom: 5px; vertical-align: top;"
                                        class="black">
                                        {{__('messages.eightDReport.teamLeader')}}
                                    </td>
                                </tr>

                                <tr>
                                    <td
                                        style="width: 115px; word-wrap: break-word; padding-left: 0; padding-bottom: 5px; vertical-align: top;">
                                        <div>{{$report->team[0]->name}}</div>
                                    </td>

                                    <td
                                        style="width: 115px; word-wrap: break-word; padding-left: 0; padding-bottom: 5px; vertical-align: top;">
                                        @if ($report->team[0]->userGroup->count())
                                            <div>{{ $report->team[0]->userGroup[0]->name }}</div>
                                        @endif
                                    </td>

                                    <td
                                        style="width: 115px; word-wrap: break-word; padding-left: 0; padding-right: 0; padding-bottom: 5px; vertical-align: top;">
                                        <div>{{$report->team[0]->email}}</div>
                                    </td>
                                </tr>
                            @endif
                        </table>
                    </td>

                    <td style="width: 50%; vertical-align: top;">
                        <div style="vertical-align: top; font-size: 16px; font-weight: 700; padding-bottom: 5px;"
                            class="black">
                            2. {{__('messages.eightDReport.problemDescription')}}
                        </div>
                        <div style="vertical-align: top;">
                            {!! $report->description !!}
                        </div>
                    </td>

                </tr>
            </table>
        </div>
    </div>

    <div>
        <div style="font-size: larger; font-weight: 700;" class="black">3.
            {{__('messages.eightDReport.immediateActions')}}
        </div>
        <div>
            <table style="width: 100%;" border="0" class="black-border">
                <tr>
                    <td style="width: 60%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.taskName')}}
                        </div>
                    </td>
                    </td>
                    <td style="width: 20%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.responsible')}}

                    </td>
                    <td style="width: 20%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.date')}}
                        </div>
                    </td>
                </tr>

                @foreach ($immediate as $task)
                    <tr>
                        <td style="width: 60%; vertical-align: top">
                            <div>
                                {{$task->name}}
                            </div>

                        </td>
                        <td style="width: 20%; vertical-align: top">
                            <div>
                                {{$task->responsible?->name}}
                            </div>
                        </td>
                        <td style="width: 20%; vertical-align: top">
                            @if ($task->end_date)
                                <div>
                                    {{date('d.m.Y', strtotime($task->end_date))}}
                                </div>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <div style="page-break-inside: avoid;">
        <div style="font-size: larger; font-weight: 700;" class="black">4.
            {{__('messages.eightDReport.correctiveActions')}}
        </div>
        <div>
            <table style="width: 100%" border="0" class="black-border">
                <tr>
                    <td style="width: 60%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.taskName')}}
                        </div>

                    </td>
                    <td style="width: 20%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.responsible')}}
                        </div>
                    </td>
                    <td style="width: 20%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.date')}}
                        </div>
                    </td>
                </tr>

                @foreach ($corrective as $task)
                    <tr>
                        <td style="width: 60%; vertical-align: top">
                            <div>
                                {{$task->name}}
                            </div>

                        </td>
                        <td style="width: 20%; vertical-align: top">
                            <div>
                                {{$task->responsible?->name}}
                            </div>
                        </td>
                        <td style="width: 20%; vertical-align: top">
                            @if ($task->end_date)
                                <div>
                                    {{date('d.m.Y', strtotime($task->end_date))}}
                                </div>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <div style="page-break-inside: avoid;">
        <div style="font-size: larger; font-weight: 700;" class="black">5.
            {{__('messages.eightDReport.implmentedActions')}}
        </div>
        <div>
            <table style="width: 100%" border="0" class="black-border">
                <tr>
                    <td style="width: 60%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.taskName')}}
                        </div>

                    </td>
                    <td style="width: 20%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.responsible')}}

                    </td>
                    <td style="width: 20%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.date')}}

                    </td>
                </tr>

                @foreach ($implemented as $task)
                    <tr>
                        <td style="width: 60%; vertical-align: top">
                            <div>
                                {{$task->name}}
                            </div>

                        </td>
                        <td style="width: 20%; vertical-align: top">
                            <div>
                                {{$task->responsible?->name}}
                            </div>
                        </td>
                        <td style="width: 20%; vertical-align: top">
                            @if ($task->end_date)
                                <div>
                                    {{date('d.m.Y', strtotime($task->end_date))}}
                                </div>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <div style="page-break-inside: avoid;">
        <div style="font-size: larger; font-weight: 700;" class="black">6.
            {{__('messages.eightDReport.preventRecurrence')}}
        </div>
        <div>
            <table style="width: 100%" border="0" class="black-border">
                <tr>
                    <td style="width: 60%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.taskName')}}
                        </div>

                    </td>
                    <td style="width: 20%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.responsible')}}
                        </div>
                    </td>
                    <td style="width: 20%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.date')}}
                        </div>
                    </td>
                </tr>

                @foreach ($preventative as $task)
                    <tr>
                        <td style="width: 60%; vertical-align: top">
                            <div>
                                {{$task->name}}
                            </div>

                        </td>
                        <td style="width: 20%; vertical-align: top">
                            <div>
                                {{$task->responsible?->name}}
                            </div>
                        </td>
                        <td style="width: 20%; vertical-align: top">
                            @if ($task->end_date)
                                <div>
                                    {{date('d.m.Y', strtotime($task->end_date))}}
                                </div>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <div style="page-break-inside: avoid;">
        <div style="font-size: larger; font-weight: 700;" class="black">7.
            {{__('messages.eightDReport.congratulations')}}
        </div>
        <div>
            <table style="width: 100%" border="1">
                <tr>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.signature')}}
                        </div>

                        <div>
                            <!-- Will come from BaseVisu  -->
                        </div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.author')}}
                        </div>

                        <div>
                            {{$report->author?->name}}
                        </div>

                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.accepted')}}
                        </div>

                        <div>
                            {{$report->author_accepted ? __('messages.eightDReport.yes') : __('messages.eightDReport.no')}}
                        </div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.closingDate')}}
                        </div>
                        @if ($report->author_closing_date)
                            <div>
                                {{date('d.m.Y', strtotime($report->author_closing_date))}}
                            </div>
                        @endif
                    </td>
                </tr>
            </table>
            <br>
            <table border="0" class="black-border">
                <tr>
                    <td style="width: 25%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.closureClient')}}
                        </div>

                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div>
                            {{$report->client_name}}
                        </div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        <div>
                            {{$report->client_accepted ? __('messages.eightDReport.yes') : __('messages.eightDReport.no')}}
                        </div>
                    </td>
                    <td style="width: 25%; vertical-align: top">
                        @if ($report->client_closing_date)
                            <div>
                                {{date('d.m.Y', strtotime($report->client_closing_date))}}
                            </div>
                        @endif
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div style="page-break-inside: avoid;">
        <div style="font-size: larger; font-weight: 700;" class="black">8. {{__('messages.eightDReport.fiveW')}}</div>
        <div>
            <table style="width: 100%" border="0" class="black-border">
                <tr>
                    <td style="width: 50%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.question')}}
                        </div>
                    </td>
                    <td style="width: 20%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.answer')}}
                        </div>
                    </td>
                </tr>

                @foreach ($fiveW as $why)
                    <tr>
                        <td style="width: 50%; vertical-align: top">
                            <div>
                                {{$why->question}}
                            </div>

                        </td>
                        <td style="width: 50%; vertical-align: top">
                            <div>
                                {{$why->answer}}
                            </div>
                        </td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <div style="page-break-inside: avoid;">
        <div style="font-size: larger; font-weight: 700;" class="black">9. {{__('messages.eightDReport.ishikawa')}}
        </div>
        <div>
            <table style="width: 100%" border="1">
                <tr>
                    <td style="width: 50%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.materials')}}
                        </div>
                        @foreach ($materials as $material)
                            <div>
                                {{$material->name}}
                            </div>
                        @endforeach
                    </td>
                    <td style="width: 50%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.machines')}}
                        </div>
                        @foreach ($materials as $measure)
                            <div>
                                {{$measure->name}}
                            </div>
                        @endforeach
                    </td>
                    <td style="width: 50%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.measurement')}}
                        </div>
                        @foreach ($measurement as $measure)
                            <div>
                                {{$measure->name}}
                            </div>
                        @endforeach
                    </td>
                </tr>

                <tr>
                    <td style="width: 50%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.motherNature')}}
                        </div>
                        @foreach ($motherNature as $nature)
                            <div>
                                {{$nature->name}}
                            </div>
                        @endforeach
                    </td>
                    <td style="width: 50%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.manpower')}}
                        </div>
                        @foreach ($manpower as $power)
                            <div>
                                {{$power->name}}
                            </div>
                        @endforeach
                    </td>
                    <td style="width: 50%; vertical-align: top">
                        <div style="font-weight: 600" class="black">
                            {{__('messages.eightDReport.methods')}}
                        </div>
                        @foreach ($methods as $method)
                            <div>
                                {{$method->name}}
                            </div>
                        @endforeach
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div style="page-break-inside: avoid;">
        <div style="font-size: larger; font-weight: 700;" class="black">10. {{__('messages.eightDReport.attachments')}}
            ({{ $attachments->count() }})
        </div>
        <br>
        <div>
            @foreach ($attachments as $index => $photo)
                <img style="margin-right: 4.3px; padding-bottom: 10px;" src="{{ $photo->path }}" width="24%">
            @endforeach
        </div>
    </div>

    <script type="text/php">
    if (isset($pdf)) {
        $text = "Page {PAGE_NUM} / {PAGE_COUNT}";
        $size = 10;
        $font = $fontMetrics->getFont("Poppins");
        $width = $fontMetrics->get_text_width($text, $font, $size) / 2;
        $x = ($pdf->get_width() - $width) / 2 + 10;
        $y = $pdf->get_height() - 35;
        $pdf->page_text($x, $y, $text, $font, $size);
    }

    if (isset($pdf)) {
        $text_date = '{{$clientSideDate}}';
        $size = 10;
        $font = $fontMetrics->getFont("Poppins");
        $width = $fontMetrics->get_text_width($text, $font, $size) / 2;
        $x = 15;
        $y = $pdf->get_height() - 35;
        $pdf->page_text($x, $y, $text_date, $font, $size);
    }
    </script>
</body>

</html>