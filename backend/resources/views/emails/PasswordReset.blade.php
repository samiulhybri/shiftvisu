<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:v="urn:schemas-microsoft-com:vml">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Template</title>
</head>

<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="margin: auto; max-width: 600px;">
        <table width="100%" style="background-color: #ffffff; padding: 20px 0; border-radius: 8px;" border="0">
            <tr>
                <td align="left" style="padding: 0 20px;">
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/' . env('MAIL_LOGO_SCT')))) }}"
                        alt="Logo" width="150" height="auto" style="display: block;" />
                </td>
            </tr>
        </table>

        <hr style="width: 100%; background-color: #edf3f5; border: none; height: 2px; margin: 20px 0;" />

        <table width="100%" style="background-color: #f6fbfc; border-radius: 8px; padding: 40px;" border="0"
            cellspacing="0" cellpadding="0">
            <tbody>
                <tr>
                    <td align="left" style="padding: 20px; color: #005981; font-weight: bold; font-size: 18px;">
                        {{ __('messages.resetPassword.sectionOne') }}
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0 20px; color: #303945; font-size: 16px; line-height: 1.6;">
                        {!! $mailData->content !!}
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding: 30px 20px;">
                        <a href="{{ $mailData->resetLink }}"
                            style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-size: 16px;">
                            {{ __('messages.resetPassword.buttonText') }}
                        </a>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 20px; color: #303945; font-size: 14px;">
                        <p>{{ __('messages.resetPassword.warning1Text') }}</p>
                        <p>{{ __('messages.resetPassword.warning2Text') }}</p>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 20px; color: #303945; font-size: 16px;">
                        {{ __('messages.resetPassword.sectionThree') }}<br />
                        <strong>{{ $mailData->from }}</strong>
                    </td>
                </tr>
            </tbody>
        </table>

        <hr style="width: 100%; background-color: #edf3f5; border: none; height: 2px; margin: 20px 0;" />
    </div>
</body>

</html>