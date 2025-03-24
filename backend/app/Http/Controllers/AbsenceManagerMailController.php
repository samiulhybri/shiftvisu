<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use App\Mail\MailAbsenceManager;
use App\Models\AbsenceRequest;
use App\Models\NotificationGroupNotificationType;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\App;

class AbsenceManagerMailController extends Controller {

    public function __construct() {
        $mailSetting = Setting::get()->first();
        if (!$mailSetting) return response()->json(['success' => false]);
        Config::set('mail.mailers.smtp.host', $mailSetting->email_host);
        Config::set('mail.mailers.smtp.port', $mailSetting->email_port);
        Config::set('mail.mailers.smtp.username', $mailSetting->email_username);
        Config::set('mail.mailers.smtp.password', $mailSetting->email_password);
        Config::set('mail.mailers.smtp.encryption', $mailSetting->email_encryption);
        Config::set('mail.from.name', $mailSetting->client_name);
        Artisan::call('config:clear');
    }

    private function send($mailData) {
        $mailInfo = [
            'to' => '',
            'from' => $mailData['from'],
            'subject' => $mailData['subject'],
            'content' => nl2br($mailData['content']),
            'request_link' => env('ABSENCE_MANAGER_REQUEST_LINK')
        ];

        $tos = [];
        $names = [];
        foreach ($mailData['to'] as $to) {
            if($to['email']) $tos[] = $to['email'];
            $names[] = $to['name'];
        }
        $mailInfo['to'] = implode(", ", $names);
        try {
            Mail::mailer('smtp')->to($tos)
                ->cc($mailData['Cc'] ?? [])
                ->send(new MailAbsenceManager($mailInfo));
            return response(["sccess" => true ], 201);
        } catch (\Exception $th) {
            return response(["sccess" => false ], 201);
        }
    }

    private function getSupervisors($absenceRequest) {
        $supervisors = [];
        if ($absenceRequest->user->supervisorOne) {
            $supervisors[] = [
                'name' => $absenceRequest->user->supervisorOne->name,
                'email' => $absenceRequest->user->supervisorOne->email
            ];
        }
        if ($absenceRequest->user->supervisorTwo) {
            $supervisors[] = [
                'name' => $absenceRequest->user->supervisorTwo->name,
                'email' => $absenceRequest->user->supervisorTwo->email
            ];
        }
        return $supervisors;
    }

    private function getEmailsForNotificationType($notificationType) {
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

    private function getLocalDateTime($utcDateTime, $isFullDay = 0) {
        $date = Carbon::parse($utcDateTime, 'UTC');
        $date->setTimezone(env('APP_TIME_ZONE'));
        return $date->format((int)$isFullDay ? 'd.m.Y' : 'd.m.Y H:i:s');
    }

    private function getAttributes($absenceRequest) {
        return [
            'from' => $absenceRequest->user->name ?? '',
            'start' => $this->getLocalDateTime($absenceRequest->start, $absenceRequest->is_full_day),
            'end' => $this->getLocalDateTime($absenceRequest->end, $absenceRequest->is_full_day),
            'absenceType' => $absenceRequest->absenceType->custom_id ?? '',
            'supervisor_note' => $absenceRequest->supervisor_note ?? '',
            'applicant_note' => $absenceRequest->applicant_note ?? '',
        ];
    }

    public function newLeaveRequest(String $lang, AbsenceRequest $absenceRequest) {
        App::setLocale($lang);
        $mailData = [];
        $absenceRequest->load(['user.supervisorOne', 'user.supervisorTwo', 'absenceType']);
        $mailData['from'] = $absenceRequest->user->name;
        $mailData['to'] = $this->getSupervisors($absenceRequest);
        $mailData['subject'] = __('messages.absenceManagerMail.newLeaveRequest.subject');
        $mailData['content'] = __('messages.absenceManagerMail.newLeaveRequest.sectionTwo', $this->getAttributes($absenceRequest));
        return $this->send($mailData);
    }

    public function leaveRequestApproval(String $lang, AbsenceRequest $absenceRequest) {
        App::setLocale($lang);
        $mailData = [];
        $absenceRequest->load(['absenceType', 'approvedBy']);
        $mailData['from'] = $absenceRequest->approvedBy->name;
        $mailData['to'][] = [
            'name' => $absenceRequest->user->name,
            'email' => $absenceRequest->user->email == $absenceRequest->user->custom_id ? '' : $absenceRequest->user->email
        ];
        $mailData['Cc'] = $this->getEmailsForNotificationType(NotificationType::ABSENCE_APPROVAL());
        $mailData['subject'] = __('messages.absenceManagerMail.leaveRequestApproval.subject');
        $mailData['content'] = __('messages.absenceManagerMail.leaveRequestApproval.sectionTwo', $this->getAttributes($absenceRequest));
        return $this->send($mailData);
    }

    public function revokeRequestApproval($lang, AbsenceRequest $absenceRequest) {
        App::setLocale($lang);
        $mailData = [];
        $absenceRequest->load(['absenceType', 'approvedBy']);
        $mailData['from'] = $absenceRequest->approvedBy->name;
        $mailData['to'][] = [
            'name' => $absenceRequest->user->name,
            'email' => $absenceRequest->user->email == $absenceRequest->user->custom_id ? '' : $absenceRequest->user->email
        ];
        $mailData['Cc'] = $this->getEmailsForNotificationType(NotificationType::ABSENCE_REQUEST_CANCELLED());
        $mailData['subject'] = __('messages.absenceManagerMail.revokeRequestApproval.subject');
        $mailData['content'] = __('messages.absenceManagerMail.revokeRequestApproval.sectionTwo', $this->getAttributes($absenceRequest));
        return $this->send($mailData);
    }

    public function leaveRequestDeclination($lang, AbsenceRequest $absenceRequest) {
        App::setLocale($lang);
        $mailData = [];
        $absenceRequest->load(['absenceType', 'approvedBy']);
        $mailData['from'] = $absenceRequest->approvedBy->name;
        $mailData['to'][] = [
            'name' => $absenceRequest->user->name,
            'email' => $absenceRequest->user->email
        ];
        $mailData['subject'] = __('messages.absenceManagerMail.leaveRequestDeclination.subject');
        $mailData['content'] = __('messages.absenceManagerMail.leaveRequestDeclination.sectionTwo', $this->getAttributes($absenceRequest));
        return $this->send($mailData);
    }

    public function revokeRequestDeclination($lang, AbsenceRequest $absenceRequest) {
        App::setLocale($lang);
        $mailData = [];
        $absenceRequest->load(['absenceType', 'approvedBy']);
        $mailData['from'] = $absenceRequest->approvedBy->name;
        $mailData['to'][] = [
            'name' => $absenceRequest->user->name,
            'email' => $absenceRequest->user->email
        ];
        $mailData['subject'] = __('messages.absenceManagerMail.revokeRequestDeclination.subject');
        $mailData['content'] = __('messages.absenceManagerMail.revokeRequestDeclination.sectionTwo', $this->getAttributes($absenceRequest));
        return $this->send($mailData);
    }

    public function deleteLeaveRequest($lang, AbsenceRequest $absenceRequest) {
        App::setLocale($lang);
        $mailData = [];
        $absenceRequest->load(['user.supervisorOne', 'user.supervisorTwo', 'absenceType']);
        $mailData['from'] = $absenceRequest->user->name;
        $mailData['to'] = $this->getSupervisors($absenceRequest);
        $mailData['subject'] = __('messages.absenceManagerMail.deleteLeaveRequest.subject');
        $mailData['content'] = __('messages.absenceManagerMail.deleteLeaveRequest.sectionTwo', $this->getAttributes($absenceRequest));
        return $this->send($mailData);
    }

    public function revokeLeaveRequest($lang, AbsenceRequest $absenceRequest) {
        App::setLocale($lang);
        $mailData = [];
        $absenceRequest->load(['user.supervisorOne', 'user.supervisorTwo', 'absenceType']);
        $mailData['from'] = $absenceRequest->user->name;
        $mailData['to'] = $this->getSupervisors($absenceRequest);
        $mailData['subject'] = __('messages.absenceManagerMail.revokeLeaveRequest.subject');
        $mailData['content'] = __('messages.absenceManagerMail.revokeLeaveRequest.sectionTwo', $this->getAttributes($absenceRequest));
        return $this->send($mailData);
    }
}
