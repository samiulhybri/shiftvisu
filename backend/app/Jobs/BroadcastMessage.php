<?php

namespace App\Jobs;

use App\Events\MessageSent;
use App\Models\Chat;
use App\Models\FcmToken;
use App\Models\Message;
use App\Models\User;
use GuzzleHttp\Exception\ConnectException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Laravel\Firebase\Facades\Firebase;

class BroadcastMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public Message $message;
    public Chat $chat;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(
        Message $message,
        Chat $chat
    ) {
        $this->message = $message;
        $this->chat = $chat;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // Users that get notified via fcm
        $fcmUsers = [];
        // Channels for users that get notified via pusher
        $pusherChannels = [];

        $sender = $this->message->sender;

        try {
            if (!env("SOKETI_DEFAULT_APP_SECRET")) {
                Log::error("Soketi app secret appears to be missing. Message can not be sent.");
                return;
            }

            $pusher = Broadcast::driver('pusher')->getPusher();
            $availableChannels = array_keys($pusher->getChannels()->channels);

            foreach ($this->chat->users as $user) {
                $channelName = 'presence-user.' . $user->id;
                if (in_array($channelName, $availableChannels)) {
                    $pusherChannels[] = $channelName;
                } else if (!$sender || $user->id != $sender->id) {
                    $fcmUsers[] = $user->id;
                }
            }

            Log::info("Sending message to " . count($pusherChannels) . " users via pusher and " . count($fcmUsers) . " users via fcm.");

            // Notify all users that are logged in via pusher
            if ($pusherChannels) {
                $pusher->trigger($pusherChannels, 'message_sent', [
                    'message' => $this->message,
                    'chat_id' => $this->chat->id,
                ]);
            }
        } catch (ConnectException $e) {
            Log::error("Could not connect to pusher service (at " . env("PUSHER_HOST") . "). Notification could not be sent.", [
                'exception' => $e,
            ]);
        }
        // Notify all users that are not logged in via fcm push
        $this->sendPushNotification(FcmToken::whereIn('user_id', $fcmUsers)->pluck('token')->toArray(), $sender);

        // TODO: A user might be logged in but afk, should we later send a push notification for such a case?

        MessageSent::dispatch($this->chat, $this->message);
    }

    /**
     * Sends a Push Notification using Firebase.
     * 
     * If the chat is a group chat, sender may be null.
     */
    function sendPushNotification(array $tokens, User|null $sender)
    {
        if (!$tokens) {
            return;
        }

        if (!env('GOOGLE_APPLICATION_CREDENTIALS')) {
            Log::error("Firebase credentials appear to be missing. Push notifications can not be sent.");
            return;
        }

        $message = CloudMessage::new()->withNotification([
            'title' => $this->chat->is_group_chat ? $this->chat->name : $sender->name,
            'body' => substr($this->message->content, 0, 100),
        ])->withApnsConfig([
            'payload' => [
                'aps' => [
                    'thread-id' => strval($this->chat->id),
                ]
            ]
        ])->withWebPushConfig([
            'fcm_options' => [
                'link' => '/chat?chat=' . strval($this->chat->id),
            ],
        ]);

        $sendReport = Firebase::messaging()->sendMulticast($message, $tokens);
        // Delete all tokens that were not found or invalid.
        foreach ([...$sendReport->unknownTokens(), ...$sendReport->invalidTokens()] as $badToken) {
            FcmToken::where('token', $badToken)->delete();
        }
    }
}
