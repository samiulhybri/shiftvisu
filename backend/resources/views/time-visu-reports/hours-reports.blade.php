@section('custom-header')
@endsection

@section('custom-footer')
    <table style="width: 600px; height: 20px;z-index: 9999; margin-top: 10px;">
        <tbody>
            <tr style="font-size: 10px; color: rgb(0,0,0,0.7);">
                <th style="width: 100px;">{{ $pageSettings['current_time'] }}</th>
            </tr>
        </tbody>
    </table>
@endsection

@section('content')
<div style="margin: 0; width: 100vw; height: 90vh; top: 80px;">
    <span><strong>{{ __('messages.timevisuReports.mainContent.dateRange') }}: {{ $report['start_date'] }} - {{ $report['end_date'] }}</strong></span>
    <table style="width: 100vw;margin-top: 10px;">
        <tbody>
            @if($report['report_data'] && sizeof($report['report_data']) > 0)
                @foreach($report['report_data'] as $tool)
                    @if($tool['table_data']['entries'] && sizeof($tool['table_data']['entries']) > 0)
                        <tr style="width: 100vw;">
                            <th style="width: 70px;text-align: left;">ToolVisu:</th>
                            <th colspan="2" style="width: 450px;text-align: left;">
                                <div style="display: flex; flex-direction: row; justify-content: start; align-items: center;">
                                    <span>{{ $tool['tool_nr'] }} - {{ $tool['tool_name'] }}</span><br>
                                    <span>{{ $tool['repair_names'] }}</span>
                                </div>
                            </th>
                            <th style="width: 100px;text-align: right;padding-right: 18px;">{{ __('messages.timevisuReports.mainContent.totalHours') }} {{ $report['year'] }}:</th>
                            <th style="width: 50px;text-align: right;padding-right: 5px;">{{ $tool['year_total_hour'] }}</th>
                        </tr>
                        <tr style="width: 100vw;">
                            <td colspan="6">
                                <table class="table table-bordered table-striped" style="width: 100vw;border: 1px solid black;">
                                    <thead>
                                        <tr>
                                            <th style="border: 1px solid black;padding-left: 3px;">{{ __('messages.timevisuReports.mainContent.date') }}</th>
                                            <!-- <th style="border: 1px solid black;padding-left: 3px;">{{ __('messages.timevisuReports.mainContent.shift') }}</th> -->
                                            <th style="border: 1px solid black;padding-left: 3px;">{{ __('messages.timevisuReports.mainContent.order') }}</th>
                                            <th style="border: 1px solid black;padding-left: 3px;">{{ __('messages.timevisuReports.mainContent.person') }}</th>
                                            <th style="border: 1px solid black;padding-left: 3px;">{{ __('messages.timevisuReports.mainContent.activity') }}</th>
                                            <th style="border: 1px solid black;padding-left: 3px;">{{ __('messages.timevisuReports.mainContent.hours') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($tool['table_data']['entries'] as $data)
                                            <tr>
                                                <td style="width: 60px;border: 1px solid black;padding-left: 3px;">{{ $data['date'] }}</td>
                                                <!-- <td style="width: 100px;border: 1px solid black;padding-left: 3px;">{{ $data['shift_name'] }}</td> -->
                                                <td style="width: 120px;border: 1px solid black;padding-left: 3px;">{{ $data['order_name'] }}</td>
                                                <td style="width: 150px;border: 1px solid black;padding-left: 3px;">{{ $data['user_name'] }}</td>
                                                <td style="width: 150px;border: 1px solid black;padding-left: 3px;">{{ $data['activity'] }}</td>
                                                <td style="width: 50px;border: 1px solid black;text-align: right;padding-right: 3px;">{{ $data['hours'] }}</td>
                                            </tr>
                                        @endforeach
                                        <tr>
                                            <td colspan="3" style="width: 75%;border: none;"></td>
                                            <td style="width: 150px;border: 1px solid black;text-align: right;padding-right: 3px;">{{ __('messages.timevisuReports.mainContent.total') }}:</td>
                                            <td style="width: 50px;border: 1px solid black;text-align: right;padding-right: 3px;">{{ $tool['table_data']['sub_total_hours'] }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    @endif
                @endforeach
            @endif
        </tbody>
    </table>
</div>
@endsection

@section('footer-page-script') 
<script type="text/php">
    if(isset($pdf)) { 
        $pdf->page_script('
            $x = 270;
            $y = 810;
            $font = $fontMetrics->get_font("Arial, Helvetica, sans-serif", "bold");
            $size = 6;
            $color = array(0,0,0,1);
            $word_space = 0.0;
            $char_space = 0.0;
            $angle = 0.0;
            $text = "{{ $pageSettings['footer_page_text'] }} {PAGE_NUM} / {PAGE_COUNT}";
            $pdf->page_text($x, $y, $text, $font, $size, $color, $word_space, $char_space, $angle);
        ');
    }
</script>
@endsection