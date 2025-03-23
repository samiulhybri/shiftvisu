<?php

namespace App\Http\Controllers;

use App\Models\AbsenceRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\App;

class AbsenceManagerEventController extends Controller
{

    public function getRefreshedToken()
    {
        $url = 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token';

        $response = Http::asForm()->post($url, [
            'client_id' => env('MS_CLIENT_ID'),
            'scope' => 'user.read offline_access',
            'grant_type' => 'password',
            'client_secret' => env('MS_CLIENT_SECRET'),
            'username' => env('MS_USERNAME'),
            'password' => env('MS_PASSWORD')
        ]);

        if ($response->successful()) {
            return $response->json()['access_token'];
        } else {
            return null;
        }
    }

    public function createCalendarEvent(String $lang, $absenceRequestId): \Illuminate\Http\JsonResponse
    {
        App::setLocale(env('DEFAULT_LANGUAGE_CODE') ?? 'en');
        $accessToken = $this->getRefreshedToken();
        if(!$accessToken){
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $absenceRequest = AbsenceRequest::with('user', 'absenceType')->find($absenceRequestId);
        if (!$absenceRequest) {
            return response()->json(['error' => 'Absence request not found.'], 404);
        }

        $isAllDay = false;
        $startDate = Carbon::parse($absenceRequest->start)->format('Y-m-d\TH:i:s');
        $endDate = Carbon::parse($absenceRequest->end)->format('Y-m-d\TH:i:s');
        $timeZone = "UTC";
        if($absenceRequest->is_full_day) {
            $isAllDay = true;
            $timeZone = env('APP_TIME_ZONE');
            $startDate = $this->getLocalDateTime($absenceRequest->start)->format('Y-m-d');
            $endDate = $this->getLocalDateTime($absenceRequest->end)->addDay()->format('Y-m-d');
        }
        $postUrl = env('MS_CALENDAR_URL') . env('MS_CALENDAR_VERSION') . env('CALENDAR_OWNER') . "calendars/" . env("CALENDAR_ID") . "/events";
        $absenceType = $absenceRequest->absenceType->custom_id ?? '';
        $eventData = [
            "isAllDay" => $isAllDay,
            "showAs"=> "free",
            "subject" => "{$absenceRequest->user->name} - ". __('messages.absenceManagerMail.calendarEventMassage1'),
            "start" => [
                "dateTime" => $startDate,
                "timeZone" => $timeZone
            ],
            "end" => [
                "dateTime" => $endDate,
                "timeZone" => $timeZone
            ]
        ];
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
            'Content-Type' => 'application/json',
        ])->post($postUrl, $eventData);

        if ($response->successful()) {
            $json_response = $response->json();
            $absenceRequest->graph_id = $json_response['id'];
            $absenceRequest->save();
            return response()->json($json_response, 200);
        } else {
            // Debugging
            return response()->json(['error' => 'Failed to post data to external API.'], 500);
        }
    }

    private function getLocalDateTime($utcDateTime) {
        $date = Carbon::parse($utcDateTime, 'UTC');
        $date->setTimezone(env('APP_TIME_ZONE'));
        return $date;
    }

    public function deleteCalendarEvent($graphId): \Illuminate\Http\JsonResponse
    {
        $accessToken = $this->getRefreshedToken();

        $deleteUrl = env('MS_CALENDAR_URL') . env('MS_CALENDAR_VERSION') . env('CALENDAR_OWNER') . "/calendars/" . env("CALENDAR_ID") . "/events/" . $graphId;

        $response = Http::withToken($accessToken)->delete($deleteUrl);

        if ($response->successful()) {
            return response()->json(['message' => 'Event deleted successfully.'], 200);
        } else {
            // If not successful, return the error
            return response()->json(['error' => 'Failed to delete the event.'], 500);
        }
    }

}