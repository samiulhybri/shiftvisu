<?php

namespace App\Helpers;

use App\Models\NotificationGroupNotificationType;

use App\Models\Setting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Artisan;


class EmailHelper
{
    public function __construct()
    {
        $mailSetting = Setting::first();

        if ($mailSetting) {
            // Set dynamic mail configuration
            Config::set('mail.mailers.smtp.host', $mailSetting->email_host);
            Config::set('mail.mailers.smtp.port', $mailSetting->email_port);
            Config::set('mail.mailers.smtp.username', $mailSetting->email_username);
            Config::set('mail.mailers.smtp.password', $mailSetting->email_password);
            Config::set('mail.mailers.smtp.encryption', $mailSetting->email_encryption);
            Config::set('mail.from.name', $mailSetting->client_name);
            Config::set('mail.from.address', $mailSetting->email_address);

            // Clear config cache to ensure updated config is used
            Artisan::call('config:clear');
        }
    }

    public function getEmailsByNotificationType($notificationType)
    {
        $hrEmails = [];
        $notificationGroupNotificationTypes = NotificationGroupNotificationType::with(['notificationGroup.notificationGroupUsers.user:id,email', 'notificationGroup.notificationGroupEmailAddresses:id,email_address,notification_group_id'])
            ->where('notification_type', $notificationType)
            ->get();
        foreach ($notificationGroupNotificationTypes as $notificationGroupNotificationType) {
            foreach ($notificationGroupNotificationType->notificationGroup->notificationGroupUsers as $notificationGroupUser) {
                $hrEmails[] = $notificationGroupUser->user->email;
            }
            foreach ($notificationGroupNotificationType->notificationGroup->notificationGroupEmailAddresses as $user) {
                $hrEmails[] = $user->email_address;
            }
        }
        return $hrEmails;
    }

    public function sendEmail($mailer, $mailInfo, $to, $mailInstance, $cc = [])
    {
        try {
            // Ensure 'from' address is set correctly
            $mailInfo['from'] ??= config('mail.from.address');

            Mail::mailer($mailer)->to($to)
                ->cc($cc)
                ->send(new $mailInstance($mailInfo));

            return response()->json(["success" => true], 201);
        } catch (\Exception $th) {
            // Log the error for debugging if needed
            \Log::error("Email sending failed: " . $th->getMessage());

            return response()->json(["success" => false, "error" => $th->getMessage()], 500);
        }
    }

}