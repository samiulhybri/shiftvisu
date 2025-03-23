# Instant Messaging

The chat component allows users to chat between each other in pairs or in groups.

## Usage

The `ChatController.send` method can be used to send messages, `ChatController.createGroup` to create new group chats.
See their API documentation for more information.

## Message Delivery

If a user is currently online (this is checked using pusher's presence channels) the message is delivered via Laravel Broadcasting,
which is configured to use pusher for sending messages. Should this delivery method prove unreliable it would also be a possibility to use FCM data notifications
instead of WebSockets (pusher).

If no device belonging to the message recipient is currently online,
the message will be sent using FCM to all the user's devices, showing as a push notification.

Status messages (i.e. whether a previous message was marked as read) are always sent using Laravel Broadcasting and will never trigger
a push notification.

## Chat Types

There are three types of chats:
- One-to-one chats: Chats between two users.
- Group chats: Chats that can be freely created by users. New members can be added/removed and members can leave.
- Managed chats: Chats that were automatically created. Members cannot be added/removed manually and members cannot leave. Messages in managed chats do not require a sender_user_id; such messages are shown as "service messages" by the frontend. 

## Performance evaluation

To evaluate performance the script in dev-scripts/send-messages might be helpful. It can be adapted to send a specific number of messages to a chat. That way it is possible to evaluate the impact of a big number of messages on performance.