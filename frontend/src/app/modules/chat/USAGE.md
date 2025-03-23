# The chat ("newsboard") module
The chat module first of all offers a component that shows all chats of a user, and allows him to create new chats.
There also is the `<app-chat-detail>` component that can be used separately. It can be used by embedding `<app-chat-detail>`
into any other component and calling `ChatService.setSelectedChat(chat)` with the chat or chat id that should be selected.
