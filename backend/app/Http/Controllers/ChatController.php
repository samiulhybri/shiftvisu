<?php

namespace App\Http\Controllers;

use App\Enums\ChatAction;
use App\Enums\ShopfloorModule;
use App\Events\MessageDeleted;
use App\Events\MessageEdited;
use App\Events\MessageRead;
use App\Jobs\BroadcastMessage;
use App\Models\Chat;
use App\Models\FcmToken;
use App\Models\Message;
use App\Models\User;
use App\Services\ChatGptService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ChatController extends Controller
{
    public function __construct(public ChatGptService $chatGptService)
    {
    }

    function sendPushNotification($notification, $data, $tokens)
    {
        if (!$tokens) {
            return;
        }

        if (!env('GOOGLE_APPLICATION_CREDENTIALS')) {
            Log::error("Firebase credentials appear to be missing. Push notifications can not be sent.");
            return;
        }

        $message = CloudMessage::new();
        if ($notification) {
            $message = $message->withNotification($notification);
        }
        if ($data) {
            $message = $message->withData($data);
        }

        $sendReport = Firebase::messaging()->sendMulticast($message, $tokens);
        // Delete all tokens that were not found or invalid.
        foreach ([...$sendReport->unknownTokens(), ...$sendReport->invalidTokens()] as $badToken) {
            FcmToken::where('token', $badToken)->delete();
        }
    }

    public function getAvailableModules(Request $request)
    {
        $values = collect(ShopfloorModule::toValues());
        if (!env("CHATGPT_ENABLED")) {
            return $values->reject(function ($value) {
                return $value == ShopfloorModule::CHAT_GPT();
            });
        } else {
            return $values;
        }
    }

    public function getChats(Request $request)
    {
        $chats = $request->user()->chats()->get();
        if (env("CHATGPT_ENABLED") && !$chats->contains(function (Chat $chat) {
            return $chat->associated_module == ShopfloorModule::CHAT_GPT();
        })) {
            $chat = $this->chatGptService->createGptChatForUser($request->user());
            return [$chat, ...$chats];
        } else if (!env("CHATGPT_ENABLED")) {
            return $chats->where("associated_module", "!=", ShopfloorModule::CHAT_GPT());
        } else {
            return $chats;
        }
    }

    public function getAvailableUsers(Request $request)
    {
        return User::whereNot("id", $request->user()->id)->get(["id", "name", "email"]);
    }

    public function getMessages(Request $request, Chat $chat)
    {
        if (!$chat->users->contains($request->user()->id)) {
            abort(403, "User is not member of this chat.");
        }
        return $chat->messages()->orderByDesc("id")->cursorPaginate(50);
    }

    public function getMessageDetail(Request $request, Message $message)
    {
        if (!$message->chat->users->contains($request->user()->id)) {
            abort(403, "User is not member of this chat.");
        }
        return $message->load("readBy:id");
    }

    public function getChatDetail(Request $request, Chat $chat)
    {
        if (!$chat->users->contains($request->user()->id)) {
            abort(403, "User is not member of this chat.");
        }
        return $chat;
    }

    public function startChat(Request $request, User $chatPartner)
    {
        // TODO: edge case: A chat already exists between the two users
        $chat = new Chat;
        $chat->save();
        $chat->users()->attach($request->user()->id);
        $chat->users()->attach($chatPartner->id);
        $chat->save();

        $chat->load("users:id,name");

        $message = $this->send(
            $request->get("message"),
            $request->file("attachments") ?? [],
            $request->user()->id,
            $chat
        );

        return ["chat" => $chat, "message" => $message];
    }

    public function startGroupChat(Request $request)
    {
        $this->createGroup(
            $request->json("name"),
            [...$request->json("users"), $request->user()->id],
            $request->user()->id,
            $request->user()->name . " created this chat",
            null,
        );
    }

    /**
     * Create a new group chat.
     * 
     * @param string $name The name of the new group chat.
     * @param array $memberIds The member IDs of this new group.
     * @param int|null $creatorUserId The creator of this group. Null if the group was automatically created.
     * @param string $creationMessage The message all the recipients will recieve as the first message in this group,
     * notifying them of its creation.
     * @param ShopfloorModule|null $module The module this chat is part of.
     * 
     * @return array{chat: Chat, message: Message} The chat that was created and the initial message that was sent.
     */
    public function createGroup(
        string $name,
        array $memberIds,
        int|null $creatorUserId,
        string $creationMessage,
        ShopfloorModule|null $module,
    ): array {
        $chat = new Chat;
        $chat->save();
        $chat->users()->attach($memberIds);
        $chat->name = $name;
        $chat->is_group_chat = true;
        $chat->is_managed_chat = $creatorUserId === null;
        $chat->associated_module = $module;
        $chat->save();

        $chat->load("users:id,name");

        $message = new Message;
        $message->sender_user_id = $creatorUserId;
        $message->chat_action = ChatAction::CREATE_CHAT();
        $message->content = $creationMessage;

        $this->send($message, [], $creatorUserId, $chat);

        return ["chat" => $chat, "message" => $message];
    }

    public function addUserToChat(Request $request, Chat $chat, User $user)
    {
        if (!$chat->users->contains($request->user()->id)) {
            abort(403, "Only chat members can add more members.");
        }

        if ($chat->users->contains($user->id)) {
            abort(403, "User is already a member of this chat.");
        }

        if (!$chat->is_group_chat) {
            abort(403, "Can not add users to a non-group chat.");
        }

        if ($chat->is_managed_chat) {
            abort(403, "Can not add users to a managed chat.");
        }

        $chat->users()->attach($user->id);

        $message = new Message;
        $message->sender_user_id = $request->user()->id;
        $message->chat_action = ChatAction::ADD_USER();
        $message->affected_user_id = $user->id;
        $message->content = $request->user()->name . " added " . $user->name . " to the chat";

        $this->send($message, [], $request->user()->id, $chat);

        return $message;
    }

    public function leaveChat(Request $request, Chat $chat)
    {
        $this->removeUserFromChat($request, $chat, $request->user());
    }

    public function removeUserFromChat(Request $request, Chat $chat, User $user)
    {
        if (!$chat->is_group_chat) {
            abort(403, "Can not remove users from a non-group chat.");
        }

        if (!$chat->users->contains($user->id)) {
            abort(403, "User is not a member of this chat.");
        }

        if ($chat->is_managed_chat) {
            abort(403, "Can not remove users from a managed chat.");
        }

        // TODO: permission checks

        $chat->users()->detach($user);

        $message = new Message;
        $message->sender_user_id = $request->user()->id;
        $message->chat_action = ChatAction::REMOVE_USER();
        $message->affected_user_id = $user->id;
        if ($user->id == $request->user()->id) {
            $message->content = $request->user()->name . " left the chat";
        } else {
            $message->content = $request->user()->name . " removed " . $user->name . " from the chat";
        }

        $this->send($message, [], $request->user()->id, $chat);

        return $message;
    }

    public function sendMessage(Request $request, Chat $chat): Message
    {
        return $this->send(
            $request->get("message"),
            $request->file("attachments") ?? [],
            $request->user()->id,
            $chat
        );
    }

    public function editMessage(Request $request, Message $message)
    {
        if (!$message->chat->users->contains($request->user()->id)) {
            abort(403, "User is not member of this chat.");
        }

        if ($message->sender_user_id != $request->user()->id) {
            abort(403, "Only the sender of a message can edit it.");
        }

        if ($message->chat_action != null) {
            abort(403, "Messages describing chat actions can not be edited.");
        }

        $message->content = $request->json("message") ?? "";
        $message->save();

        MessageEdited::dispatch($message);
    }

    public function deleteMessage(Request $request, Message $message)
    {
        if (!$message->chat->users->contains($request->user()->id)) {
            abort(403, "User is not member of this chat.");
        }

        if ($message->sender_user_id != $request->user()->id) {
            abort(403, "Only the sender of a message can delete it.");
        }

        $message->readBy()->detach();

        $message->delete();

        MessageDeleted::dispatch($message);
    }

    function getChatTokens(Chat $chat, int $senderUserId): array
    {
        return $chat->users()->whereNot("user_id", $senderUserId)->with('fcmTokens')->get()
            ->pluck('fcmTokens')->flatten()->pluck('token')->toArray();
    }

    /**
     * Send a message.
     * 
     * @param string|Message|null $messageContent The message to be sent. If a string, a message object with this string as content
     * will be created. Null is equivalent to supplying an empty string.
     * @param UploadedFile|array $files The list of files to attach to the message. Either a single file or an array of files.
     * @param int|null $senderUserId The sender of this message. Null if this is an automated message.
     * @param Chat $chat The chat this message should be sent in.
     * 
     * @return Message The message that was just sent.
     */
    public function send(string|Message|null $messageContent, UploadedFile|array $files, int|null $senderUserId, Chat $chat): Message
    {
        if ($senderUserId && !$chat->users->contains($senderUserId)) {
            abort(403, "User is not member of this chat.");
        }

        if (!$senderUserId && !$chat->is_managed_chat) {
            abort(403, "Can not send service messages (messages without a sender) to chats other than managed chats.");
        }

        if ($files instanceof UploadedFile) {
            $files = [$files];
        }

        if ($messageContent instanceof Message) {
            $message = $messageContent;
        } else {
            $message = new Message;
            $message->sender_user_id = $senderUserId;
            $message->content = $messageContent ?? "";
        }

        $chat->messages()->save($message);

        foreach ($files as $file) {
            $message->addMedia($file)->toMediaCollection();
        }

        $message->readBy()->attach(
            $chat->users->pluck('id')
                ->mapWithKeys(fn (int $userId) => [$userId => ['read' => $userId == $senderUserId]])
                ->toArray()
        );

        if ($chat->users->count() == 1) {
            $message->read_by_all = true;
        }

        $message->save();

        BroadcastMessage::dispatch(
            $message,
            $chat,
        );

        $message->load('media');

        return $message;
    }

    public function downloadAttachment(Request $request, Media $mediaItem)
    {

        if (!$mediaItem->model->chat->users->contains($request->user()->id)) {
            abort(403, "User is not member of this chat.");
        }

        return $mediaItem;
    }

    public function markAsRead(Request $request, Message $message)
    {
        // syncWithoutDetaching prevents duplicated rows.
        $message->readBy()->syncWithoutDetaching([$request->user()->id => ['read' => true]]);

        if ($message->readBy->every(fn ($read_status) => $read_status->message_read_status->read)) {
            $message->read_by_all = true;
            MessageRead::dispatch($message);
        }

        $message->save();
    }

    public function registerFcmToken(Request $request)
    {
        $token = $request->input('token');
        $existingEntry = FcmToken::where('token', $token)->first();
        if ($existingEntry) {
            if ($existingEntry->user_id != $request->user()->id) {
                $existingEntry->user_id = $request->user()->id;
                $existingEntry->save();
            } else {
                // Update the timestamp.
                $existingEntry->touch();
            }
        } else {
            $request->user()
                ->fcmTokens()
                ->create([
                    'token' => $token,
                ]);
        }
    }
}
