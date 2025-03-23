<?php

namespace App\Listeners;

use App\Enums\ShopfloorModule;
use App\Events\MessageSent;
use App\Services\ChatGptService;

class ChatGptMessageListener
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct(
        private ChatGptService $chatGptService
    ) {
        //
    }

    /**
     * Handle the event.
     *
     * @param  object  $event
     * @return void
     */
    public function handle(MessageSent $event)
    {
        if ($event->chat->associated_module === ShopfloorModule::CHAT_GPT() && $event->message->sender_user_id) {
            $this->chatGptService->generateAndAppendSuggestion($event->chat, true);
        }
    }
}
