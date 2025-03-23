<?php

namespace App\Services;

use App\Enums\ShopfloorModule;
use App\Events\LatestMessageStreamEvent;
use App\Http\Controllers\ChatController;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class ChatGptService
{
    public function generateSuggestion(Chat $chat, bool $shouldBroadcast): string|null
    {
        if (!env("OPENAI_API_KEY")) {
            Log::error("OPENAI_API_KEY is empty, cannot generate suggestion");
            return null;
        }

        if (!env("CHATGPT_ENABLED")) {
            Log::error("CHATGPT_ENABLED is not set, but generation of a suggestion was requested.");
            return null;
        }

        $latestMessages = $chat->messages()->latest()->take(env("CHATGPT_CONTEXT_MESSAGES"))->get();

        $latestMessages = $latestMessages->reverse()->values();

        $query = [
            "model" => env("OPENAI_MODEL"),
            "messages" => [
                [
                    "role" => "system",
                    "content" => env("CHATGPT_PROMPT") .
                        " Up to" . env("CHATGPT_CONTEXT_MESSAGES") . " previous messages are provided as context if available."
                ],
                ...$latestMessages->map(function (Message $message) {
                    return [
                        "role" => $message->sender_user_id ? "user" : "assistant",
                        "content" => $message->content,
                    ];
                })
            ]
        ];

        // Send an initial empty message to show a typing indicator
        LatestMessageStreamEvent::dispatch($chat, "");

        $streamedResult = OpenAI::chat()->createStreamed($query);
        $finalResult = "";
        $counter = 0;
        foreach ($streamedResult->getIterator() as $value) {
            if ($value->toArray()['choices'][0]["finish_reason"]) {
                break;
            }
            $delta = $value->toArray()['choices'][0]['delta']["content"];
            $finalResult .= $delta;
            // Dispatching events is costly, don't do it all the time.
            if ($shouldBroadcast && $counter % 10 == 0) {
                LatestMessageStreamEvent::dispatch($chat, $finalResult);
            }
            $counter++;
        }
        return $finalResult;
    }

    public function generateAndAppendSuggestion(Chat $chat, bool $shouldBroadcast)
    {
        $suggestion = $this->generateSuggestion($chat, $shouldBroadcast);
        if (!$suggestion) {
            return;
        }
        $chatController = new ChatController($this);
        $chatController->send($suggestion, [], null, $chat);
    }

    public function createGptChatForUser(User $user): Chat
    {
        $chatController = new ChatController($this);
        return $chatController->createGroup(
            "ChatGPT",
            [$user->id],
            null,
            "ChatGPT is now available",
            ShopfloorModule::CHAT_GPT(),
        )["chat"];
    }
}
