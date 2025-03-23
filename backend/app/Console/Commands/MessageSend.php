<?php

namespace App\Console\Commands;

use App\Http\Controllers\ChatController;
use App\Models\Chat;
use Illuminate\Console\Command;

class MessageSend extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chat:send_message {chat_id} {message}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a message to a chat.';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(ChatController $chatController)
    {
        $chatId = $this->argument('chat_id');
        $message = $this->argument('message');
        $chatController->send($message, null, Chat::find($chatId));
        return Command::SUCCESS;
    }
}
