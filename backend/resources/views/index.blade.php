<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
    @if($pageSettings['main-details'] == 'MP-Offer')
    <title>{{ __('messages.mpOfferPdf.title') }}</title>
    @else
    <title>{{ __('messages.pdfDetails.pageTitle') }}</title>
    @endif


    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

    <style type="text/css">
        @font-face {
            font-family: Arial;
            font-size: normal;
            font-weight: normal;
            src: url('{{ storage_path("fonts/arialmt.ttf") }}') format('truetype');
        }

        body {
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 10px;
            font-weight: 400;
            line-height: 15px;
            font-style: normal;
        }

        @media screen and (min-width: 700px) and (max-width: 1100px) {
            .page-bg-img {
                position: fixed;
                top: -50px;
                left: -40px;
                width: 700px !important;
                height: 350px !important;
                z-index: 99;
            }

            .page-bg-img img {
                width: 100%;
                height: 90%;
            }

            header {
                position: fixed;
                top: -30px;
                left: 0;
                right: 0;
                width: 700px !important;
                height: 50px;
                /* background-color: #FFFF; */
                line-height: 40px;
                font-family: Arial, Helvetica, sans-serif !important;
                z-index: 9999;
            }

            .header {
                width: 100vw !important;
            }

            .header tr {
                margin-top: 10px;
            }

            .header .header-company-image {
                float: left;
                margin: 50px 0 10px;
                width: 100vw !important;
                height: 20px !important;
                position: fixed;
                top: -30px;
                left: 0;
            }

            .header-left-side {
                width: 60%;
            }

            .header-right-side {
                width: 40%;
            }
            .header-left-side img {
                width: 80%;
                height: 80%;
                opacity: 1;
            }

            .powered_by_section {
                text-align: right;
                box-sizing: border-box;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
            }

            .powered_by_section img {
                margin-top: 10px;
                width: 40%;
                height: 40%;
                opacity: 1;
            }
            .client-logo img {
                margin-top: 5px;
                width: 80%;
                height: 60%;
                opacity: 1;
            }

            .header-details {
                width: 100vw !important;
                height: 30px;
                position: fixed;
                top: -10px;
                left: 0;
            }

            .pdf-details-table {
                width: 100vw !important;
            }

            .pdf-details-table,
            .pdf-details-table th {
                border-collapse: collapse;
                border: 1px solid rgba(0, 0, 0, 0.5);
            }

            .pdf-details-table th {
                text-align: left;
                padding: 10px;
                line-height: 20px;
                font-size: 14px;
            }

            main {
                width: 100vw;
                position: relative;
                top: 30px;
                left: 0;
                z-index: 9999;
            }

            footer {
                position: fixed;
                bottom: -30px;
                left: 0;
                right: 0;
                height: 40px;
            }

            .footer-table {
                position: fixed;
                bottom: 30px;
                left: 0;
                width: 100vw;
                height: 100%;
            }

            #footer-details-table td {
                width: 234px;
                margin: 0;
                padding: 0;
            }

            #footer-details-table td div {
                padding: 2px 5px;
                border: 1px solid rgb(0, 0, 0, 0.5);
            }

            .page-footer-img {
                position: fixed;
                bottom: -45px;
                left: -50px;
                right: -30px;
            }

            .page-footer-img img {
                width: 800px;
                height: 100%;
                opacity: 1;
                background-repeat: no-repeat;
            }
        }

        @media print {
            @page {
                size: A4;
                margin: 100px 25px;
                font-family: Arial, Helvetica, sans-serif !important;
            }

            html,
            body {
                height: 100vh;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden;
            }

            body {
                visibility: hidden;
                font-family: Arial, Helvetica, sans-serif !important;
                font-size: 10px;
                font-weight: 400;
                line-height: 15px;
                font-style: normal;
            }

            main,
            main * {
                visibility: visible;
            }
        }
    </style>
</head>

<body>
    @if($pageSettings['showWaterMark'])
    <div class="page-bg-img">
        <?php $pageBgImage = base64_encode(file_get_contents(public_path('/images/page-background.jpg'))); ?>
        <img src="data:image/png;base64, '.{{ $pageBgImage }}'">
    </div>
    @endif

    @if($pageSettings['hasHeader'] == true)
    <header>
        <table class="header">
            <tr style="width: 100vw;">
                <td class="header-company-image">
                @php
                    $borderStyle = 'none';
                    if ($pageSettings['applyHeaderBorder']) {
                        if ($pageSettings['main-details'] == 'MP-Offer') {
                            $borderStyle = '2px solid rgba(0,0,0,0.5)';
                        } else {
                            $borderStyle = '1px solid #005981';
                        }
                    }
                @endphp
                    <table style="width: 100vw; border-bottom: {{ $borderStyle }};">
                        <tr style="width: 100vw;">
                            <td class="header-left-side" style="width: 500px;text-align: left;margin-bottom: 5px;">
                                @if($pageSettings['showScherTechLogo'])
                                    <?php $logoImage = base64_encode(file_get_contents(public_path('/images/schertech-logo.png'))); ?>
                                    <img src="data:image/png;base64, '.{{ $logoImage }}'">
                                @elseif($pageSettings['showHeaderTitle'])
                                    <span style="font-size: 24px;position:fixed;top: -35px;"><strong>{{ $pageSettings['header-title'] }}</strong></span>
                                @else
                                    @if($pageSettings['main-details'] == 'MP-Offer')
                                        @include('mpOffer/mp-offer-print', [ 'mpOffer' => $viewData ])
                                        @yield('custom-header')
                                    @endif
                                @endif
                            </td>
                            <td class="header-right-side client-logo" style="width: 200px;text-align: right;margin-bottom: 5px;">
                                @if($pageSettings['showClientLogo'] == true)
                                    <?php $clientLogo = base64_encode(file_get_contents(public_path($pageSettings['clientLogoUrl']))); ?>
                                    <img src="data:image/png;base64, '.{{ $clientLogo }}'">
                                @endif
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            @if($pageSettings['showHeaderTitleTable'])
            <tr class="header-details">
                <table class="pdf-details-table">
                    <tr>
                        <th style="width: 150px;">{{ $pageSettings['header-title'] }}</th>
                        <th style="width: 508px;">{{ $pageSettings['header-subTitle'] }}</th>
                    </tr>
                </table>
            </tr>
            @endif
        </table>
    </header>
    @endif

    @if($pageSettings['isCustomFooter'])
        @if($pageSettings['main-details'] == 'MP-Offer')
        <footer style="border-top: 2px solid rgb(0,0,0,0.5);">
            @include('mpOffer/mp-offer-print', [ 'pageSettings' => $pageSettings, 'mpOffer' => $viewData ])
            @yield('custom-footer')
        </footer>
        @elseif($pageSettings['main-details'] == 'Offers')
        <footer style="border-top: 2px solid rgb(0,0,0,0.5);">
            @include('hwe-kalk/offer-summary', [ 'pageSettings' => $pageSettings, 'offer' => $viewData ])
            @yield('custom-footer')
        </footer>
        @endif
    @elseif($pageSettings['showSimpleFooter'])
    <footer style="border-top: 1px solid #005981;">
        <table style="width: 100%; height: 20px;z-index: 9999;">
            <tbody>
                <tr style="width: 100%;">
                    <th style="width: 50%;text-align: left;font-size: 8px; font-weight: 500; color: rgb(0,0,0,1);">{{ $pageSettings['current_time'] }}</th>
                    @if($pageSettings['showPoweredBy'] == true)
                        <th style="width: 50%;text-align: right;">
                            <div class="powered_by_section">
                                <span style="font-size: 8px;color:#00000080;">{{ __('messages.pdfDetails.header.powered_by') }}:</span>
                                <?php $logoImage = base64_encode(file_get_contents(public_path('/images/schertech-logo.png'))); ?>
                                <img src="data:image/png;base64, '.{{ $logoImage }}'">
                            </div>
                        </th>
                    @else 
                        <th></th>
                    @endif
                </tr>
            </tbody>
        </table>
    </footer>
    @else 
    <footer>
        <table class="footer-table">
            <tr>
                <td>
                    @if($pageSettings['showFooterDetails'])
                    <table id="footer-details-table">
                        <tbody>
                            <tr>
                                <td>
                                    <div>{{ __('messages.pdfDetails.footer.created') }}: {{ $pageSettings['pdfCreatedBy'] }}</div>
                                </td>
                                <td>
                                    <div style="border-left: 0">{{ __('messages.pdfDetails.footer.checked') }}: {{ $pageSettings['pdfCheckedBy'] }}</div>
                                </td>
                                <td style="text-align: center;">
                                    <div style="border-left: 0">{{ $pageSettings['pdfVersion'] }}</div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div style="border-top: 0">{{ __('messages.pdfDetails.footer.validFrom') }}: {{ $pageSettings['validity'] }}</div>
                                </td>
                                <td>
                                    <div style="border-top: 0;  border-left: 0;">{{ __('messages.pdfDetails.footer.released') }}: {{ $pageSettings['pdfReleasedBy'] }}</div>
                                </td>
                                <td>
                                    <div style="border-top: 0;  border-left: 0;">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="3">
                                    <div style="border-top: 0">{{ __('messages.pdfDetails.footer.location') }}: {{ $pageSettings['location'] }}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    @endif
                </td>
            </tr>
            @if($pageSettings['showFooterImage'])
            <tr>
                <td>
                    <div class="page-footer-img">
                        <?php $pageFooterImg = base64_encode(file_get_contents(public_path('/images/footer.png'))); ?>
                        <img src="data:image/png;base64, '.{{ $pageFooterImg }}'">
                    </div>
                </td>
            </tr>
            @endif
        </table>
    </footer>
    @endif

    <main>
        @if($pageSettings['main-details'] == 'MP-Offer')
            @include('mpOffer/mp-offer-print', [ 'mpOffer' => $viewData ])
            @yield('content')
        @elseif($pageSettings['main-details'] == 'Offers')
            @include('hwe-kalk/offer-summary', [ 'offerPos' => $viewData ])
            @yield('content')
        @elseif($pageSettings['main-details'] == 'TimeVisu')
            @include('time-visu-reports/hours-reports', [ 'report' => $viewData ])
            @yield('content')
        @endif
    </main>

    @yield('footer-page-script')
</body>

</html>