<?php

namespace App\Http\Controllers;

use App\Models\NotificationGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class NotificationGroupController extends Controller
{
    /**
     * add data to notification_group_users pivot table
     * @param Request $request
     */
    public function syncNotificationGroupUsers(Request $request): JsonResponse
    {
        try {
            $userIds = $request->userIds;
            $notificationGroup = NotificationGroup::find($request->id);

            // It handles creating/deleting both operations
            $notificationGroup->users()->sync($userIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }
}