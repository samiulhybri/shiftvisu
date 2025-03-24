<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:v="urn:schemas-microsoft-com:vml">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Template</title>
</head>

<body style="margin: 0 !important; padding: 0 !important;">
    <div style="margin: auto auto; width: 1062px;">
        <table width="1062" height="40" align="center" style="margin: 0px; padding: 0px; background-color: #ffffff;"
            border="0">
            <tr>
                <td align="left">
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/' . env('MAIL_LOGO_SCT')))) }}"
                        alt="Logo" width="229" height="65" />
                </td>
            </tr>
        </table>
        <hr
            style="width: 1062px; float: left; background-color: rgb(237, 243, 245); color: rgb(237, 243, 245); height: 2px; border: 0; margin-bottom: 11px; margin-top: 8px;" />
        <table width="1062" height="368" align="center" style="margin: 0px; padding: 0px; background-color: #ffffff;"
            border="0" cellspacing="0" cellpadding="20">
            <tbody>
                <tr>
                    <td align="left" valign="middle"
                        style="width: 1062px; border-radius: 7px; padding-left: 71px; padding-right: 71px; padding-top: 78px; padding-bottom: 78px; background-color: #f6fbfc;">
                        <span style="color: #005981; font-weight: bold; font-size: 18px; line-height: 28px;">
                            {{ __('messages.importFailed.sectionOne', ['name' => $mailData->to]) }}
                        </span><br /><br /><br />
                        <span style="color: #303945; font-weight: normal; font-size: 18px; line-height: 28px;">
                            {!! $mailData->content !!}
                        </span><br /><br /><br />
                        <span style="color: #303945; font-weight: normal; font-size: 18px; line-height: 28px;">
                            {{ __('messages.importFailed.sectionThree') }}
                        </span><br />
                        <span style="color: #303945; font-weight: bold; font-size: 18px; line-height: 28px;">
                            {{ $mailData->from }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
        <hr
            style="width: 1062px; float: left; background-color: rgb(237, 243, 245); color: rgb(237, 243, 245); height: 2px; border: 0; margin-bottom: 2px; margin-top: 11px;" />
    </div>
</body>

</html>