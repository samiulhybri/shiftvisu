import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  first,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from "rxjs";
import { environment } from "src/environments/environment";
import { PusherService as PushService } from "../../../shared/services/pusher.service";
import {
  Chat,
  ChatDto,
  PaginationDto,
  CreateChatDto,
} from "../models/chat.model";
import { Attachment, Message, MessageDto } from "../models/message.model";
import {
  MessageSentDto,
  MessageReadDto,
  MessageSent,
  MessageRead,
  MessageEditedDto,
} from "../models/push.model";
import { User } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";
import { ReadByUserStatus } from "@app/enums/message-read-status.enum";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  // Messages are sorted from newest to oldest.
  messages: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  nextMessagesCursor: string | null = null;

  selectedModule = new BehaviorSubject<string | null>(null);

  allChats = new BehaviorSubject<Chat[] | undefined>(undefined);
  filteredChats = combineLatest([this.allChats, this.selectedModule]).pipe(
    map(([chats, module]) => {
      if (!module) {
        return chats;
      }
      return chats?.filter((c) => c.module === module);
    }),
    tap((chats) => {
      // Check if the selected chat is still an option in the new list.
      if (chats && !chats.find((c) => c.id === this.selectedChatId.value)) {
        this.selectedChatId.next(null);
      }
    })
  );
  selectedChatId = new BehaviorSubject<number | null>(null);
  selectedChat = this.selectedChatId.pipe(
    switchMap((id) => this.getChatById(id))
  );
  selectedUser = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    pushService: PushService
  ) {
    pushService.userChannel
      .pipe(
        tap((channel) => {
          if (channel === null) {
            return;
          }
          channel.bind("message_sent", (dto: MessageSentDto) => {
            this.handleMessageSent(MessageSent.fromDto(dto));
          });
          channel.bind("message_read", (dto: MessageReadDto) => {
            this.handleMessageRead(MessageRead.fromDto(dto));
          });
          channel.bind("message_edited", (dto: MessageEditedDto) => {
            const chat = this.allChats.value?.find((c) => c.id === dto.chat_id);
            if (!chat) {
              return;
            }
            this.handleMessageEdited(Message.fromDto(dto.message));
          });
          channel.bind("message_deleted", (dto: { message_id: number }) => {
            this.handleMessageDeleted(dto.message_id);
          });
          channel.bind(
            "latest_message_stream",
            (dto: { chat_id: number; content: string }) => {
              this.handleLatestMessageStream(dto.chat_id, dto.content);
            }
          );
        })
      )
      .subscribe();
  }

  private async handleLatestMessageStream(chatId: number, content: string) {
    const chat = this.allChats.value?.find((c) => c.id === chatId);
    if (!chat) {
      return;
    }
    const message = new Message(
      null,
      null,
      new User(),
      content,
      ReadByUserStatus.unread,
      false,
      new Date(),
      null,
      [],
      content == ""
    );
    this.allChats.next(
      this.allChats.value?.map((c) =>
        c.id === chatId ? chat.copyWith({ latestMessage: message }) : c
      )
    );
    if (this.selectedChatId.value === chatId) {
      this.messages.next([message, ...this.messages.value.filter((m) => m.id)]);
    }
  }

  private async handleMessageSent(event: MessageSent) {
    let existingChat = this.allChats.value?.find((c) => c.id === event.chatId);
    if (existingChat) {
      const message = Message.fromDto(event.message);

      existingChat = existingChat.copyWith({ latestMessage: message });
      // We will also get notified about our own messages (they might have been sent from another device)
      if (message.getIsIncoming(this.authService.user)) {
        existingChat = existingChat.copyWith({
          unreadMessagesCount: existingChat.unreadMessagesCount + 1,
        });
      }
      // introduce a temporary variable to make type promotion work
      const newChat = existingChat;
      this.allChats.next(
        this.allChats.value?.map((c) => (c.id === newChat.id ? newChat : c))
      );
      if (this.selectedChatId.value === event.chatId) {
        // We might receive a push notification about a message we have sent.
        if (!this.messages.value.find((m) => m.id === message.id)) {
          // Remove all temporary messages that had no id
          this.messages.next([
            message,
            ...this.messages.value.filter((m) => m.id),
          ]);
        }
      }
    } else {
      let newChat = await firstValueFrom(this.loadChatDetail(event.chatId));
      const message = Message.fromDto(event.message);
      newChat = newChat.copyWith({ latestMessage: message });

      if (this.allChats.value?.find((c) => c.id === newChat.id)) {
        // We have already loaded this chat.
        return;
      }

      this.allChats.next([newChat, ...(this.allChats.value ?? [])]);
      // If the currently selected user is the one who this chat is with,
      // select the chat instead of the user.
      if (
        !newChat.isGroupChat &&
        this.selectedUser.value?.id ==
          newChat.getPartner(this.authService.user).id
      ) {
        this.selectedChatId.next(newChat.id);
        this.selectedUser.next(null);
      }
    }
  }

  private handleMessageRead(event: MessageRead) {
    if (this.selectedChatId.value === event.chatId) {
      this.messages.next(
        this.messages.value.map((m) => {
          if (m.id === event.messageId) {
            m = m.copyWith({ readByAll: true });
          }
          return m;
        })
      );
    }
  }

  private handleMessageEdited(message: Message) {
    // Update the message in the list of messages.
    this.messages.next(
      this.messages.value.map((m) => {
        if (m.id === message.id) {
          return message;
        } else {
          return m;
        }
      })
    );

    // Update the message if it was also the latest message of the chat.
    this.allChats.next(
      this.allChats.value?.map((c) => {
        if (c.latestMessage?.id === message.id) {
          c = c.copyWith({
            latestMessage: message,
          });
        }
        return c;
      })
    );
  }

  private handleMessageDeleted(messageId: number) {
    this.messages.next(this.messages.value.filter((m) => m.id !== messageId));

    // Update the latest message of the chat if it was the deleted message.
    const chatToUpdate = this.allChats.value?.find(
      (c) => c.latestMessage?.id === messageId
    )?.id;
    if (chatToUpdate) {
      this.loadChatDetail(chatToUpdate).subscribe((newChat) => {
        this.allChats.next(
          this.allChats.value?.map((c) => {
            if (c.id === newChat.id) {
              return newChat;
            } else {
              return c;
            }
          })
        );
      });
    }
  }

  getChatById(id: number | null): Observable<Chat | null> {
    if (id === null) {
      return of(null);
    }
    return this.allChats.pipe(
      map((chats) => chats?.find((c) => c.id === id) ?? null)
    );
  }

  loadChats(): Observable<void> {
    return this.http.get<ChatDto[]>(`${environment.apiPrefix}/chat/chats`).pipe(
      map((chats) => {
        this.allChats.next(chats.map((chat) => Chat.fromDto(chat)));
      })
    );
  }

  setSelectedUser(user: User) {
    this.selectedUser.next(user);
    this.selectedChatId.next(null);
    this.messages.next([]);
  }

  setSelectedChat(chat: Chat | number) {
    this.selectedChatId.next(typeof chat === "number" ? chat : chat.id);
    this.selectedUser.next(null);
    this.loadMessages().subscribe();
  }

  loadAvailableUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${environment.apiPrefix}/chat/available_users`)
      .pipe(
        map((users) => users.map((user) => Object.assign(new User(), user)))
      );
  }

  loadAvailableModules(): Observable<string[]> {
    return this.http.get<string[]>(
      `${environment.apiPrefix}/chat/available_modules`
    );
  }

  markMessageAsRead(messageId: number): Observable<void> {
    let messageHasToBeMarkedAsRead = false;
    this.messages.next(
      this.messages.value.map((message) => {
        if (message.id === messageId) {
          messageHasToBeMarkedAsRead =
            message.readByUser === ReadByUserStatus.unread;
          if (messageHasToBeMarkedAsRead) {
            message = message.copyWith({ readByUser: ReadByUserStatus.read });
          }
        }
        return message;
      })
    );

    if (!messageHasToBeMarkedAsRead) {
      return EMPTY;
    }

    this.allChats.next(
      this.allChats.value?.map((chat) => {
        if (chat.id === this.selectedChatId.value) {
          chat = chat.copyWith({
            unreadMessagesCount: chat.unreadMessagesCount - 1,
          });
        }
        return chat;
      })
    );
    return this.http.patch<void>(
      `${environment.apiPrefix}/chat/mark_as_read/${messageId}`,
      {}
    );
  }

  loadMessages(): Observable<void> {
    return this.selectedChat.pipe(
      first(),
      switchMap((chat) => {
        if (!chat) {
          return EMPTY;
        }

        // Show an empty list while loading the messages.
        this.messages.next([]);

        return this.requestMessages(chat, null).pipe(
          map((messages) => {
            // Do not update the messages if the selected chat has changed in the meantime.
            if (this.selectedChatId.value === chat.id) {
              this.messages.next(messages);
            }
          })
        );
      })
    );
  }

  loadMoreMessages(): Observable<void> {
    return this.selectedChat.pipe(
      first(),
      switchMap((chat) => {
        if (!chat || !this.nextMessagesCursor) {
          return EMPTY;
        }

        return this.requestMessages(chat, this.nextMessagesCursor).pipe(
          map((messages) => {
            // Do not update the messages if the selected chat has changed in the meantime.
            if (this.selectedChatId.value === chat.id) {
              this.messages.next([...this.messages.value, ...messages]);
            }
          })
        );
      })
    );
  }

  private requestMessages(
    chat: Chat,
    cursor: string | null
  ): Observable<Message[]> {
    return this.http
      .get<PaginationDto<MessageDto>>(
        `${environment.apiPrefix}/chat/${chat.id}/messages`,
        {
          params: cursor
            ? {
                cursor,
              }
            : undefined,
        }
      )
      .pipe(
        map((paginationDto) => {
          const messages = paginationDto.data;
          this.nextMessagesCursor = paginationDto.next_cursor;
          return messages.map((message) => Message.fromDto(message));
        })
      );
  }

  loadMessageDetail(messageId: number, chat: Chat): Observable<Message> {
    return this.http
      .get<MessageDto>(`${environment.apiPrefix}/chat/message/${messageId}`)
      .pipe(map((message) => Message.fromDto(message)));
  }

  loadChatDetail(chatId: number): Observable<Chat> {
    return this.http
      .get<ChatDto>(`${environment.apiPrefix}/chat/chat/${chatId}`)
      .pipe(map((chat) => Chat.fromDto(chat)));
  }

  createChat(
    user: User,
    message: string,
    attachments: File[]
  ): Observable<void> {
    const formData = new FormData();
    formData.append("message", message);
    attachments.forEach((attachment) => {
      formData.append("attachments", attachment);
    });

    return this.http
      .post<CreateChatDto>(
        `${environment.apiPrefix}/chat/start_chat/${user.id}`,
        formData
      )
      .pipe(
        map((createChatDto) => {
          const chat = Chat.fromDto(createChatDto.chat);

          if (this.allChats.value?.find((c) => c.id === chat.id)) {
            // Similar to sendMessage(), we might have already received a message that this chat was created.
            return;
          }

          const message = Message.fromDto(createChatDto.message);
          this.selectedChatId.next(chat.id);
          this.selectedUser.next(null);
          this.messages.next([message]);

          this.allChats.next([chat, ...(this.allChats.value ?? [])]);
        })
      );
  }

  createGroupChat(users: number[], name: string): Observable<void> {
    return this.http
      .post<CreateChatDto>(`${environment.apiPrefix}/chat/start_group_chat`, {
        name,
        users,
      })
      .pipe(
        map((createChatDto) => {
          const chat = Chat.fromDto(createChatDto.chat);
          const message = Message.fromDto(createChatDto.message);
          this.messages.next([message]);

          this.allChats.next([chat, ...(this.allChats.value ?? [])]);

          this.selectedChatId.next(chat.id);
          this.selectedUser.next(null);
        })
      );
  }

  sendMessage(
    chat: Chat,
    message: string,
    attachments: File[]
  ): Observable<void> {
    const formData = new FormData();
    formData.append("message", message);
    attachments.forEach((attachment) => {
      formData.append("attachments[]", attachment);
    });
    return this.http
      .post<MessageDto>(
        `${environment.apiPrefix}/chat/${chat.id}/send_message`,
        formData
      )
      .pipe(
        map((dto) => {
          const message = Message.fromDto(dto);

          // We need to make sure that this message has not already been received via the websocket.
          // It can occur that the websocket message is received before the response of the HTTP request.
          if (!this.messages.value.find((m) => m.id === message.id)) {
            // Remove all temporary messages that had no id
            this.messages.next([
              message,
              ...this.messages.value.filter((m) => m.id),
            ]);

            this.allChats.next(
              this.allChats.value?.map((c) => {
                if (c.id === chat.id) {
                  c = c.copyWith({
                    latestMessage: message,
                  });
                }
                return c;
              })
            );
          }
        })
      );
  }

  editMessage(message: Message, newText: string): Observable<void> {
    return this.http
      .patch<void>(`${environment.apiPrefix}/chat/edit_message/${message.id}`, {
        message: newText,
      })
      .pipe(
        map(() => {
          const newMessage = message.copyWith({
            text: newText,
          });
          this.handleMessageEdited(newMessage);
        })
      );
  }

  deleteMessage(message: Message): Observable<void> {
    return this.http
      .delete<void>(
        `${environment.apiPrefix}/chat/delete_message/${message.id}`,
        {}
      )
      .pipe(
        map(() => {
          this.handleMessageDeleted(message.id!);
        })
      );
  }

  leaveChat(chat: Chat): Observable<void> {
    return this.http
      .patch<void>(`${environment.apiPrefix}/chat/${chat.id}/leave_chat`, {})
      .pipe(
        map(() => {
          this.allChats.next(
            this.allChats.value?.filter((c) => c.id !== chat.id)
          );
          this.selectedChatId.next(null);
          this.messages.next([]);
        })
      );
  }

  removeUserFromChat(chat: Chat, user: User): Observable<void> {
    return this.http
      .patch<void>(
        `${environment.apiPrefix}/chat/${chat.id}/remove_user/${user.id}`,
        {}
      )
      .pipe(
        map(() => {
          this.allChats.next(
            this.allChats.value?.map((c) => {
              if (c.id === chat.id) {
                c = c.copyWith({
                  members: c.members.filter((p) => p.id !== user.id),
                });
              }
              return c;
            })
          );
        })
      );
  }

  addUserToChat(chat: Chat, user: User): Observable<void> {
    return this.http
      .patch<void>(
        `${environment.apiPrefix}/chat/${chat.id}/add_user/${user.id}`,
        {}
      )
      .pipe(
        map(() => {
          this.allChats.next(
            this.allChats.value?.map((c) => {
              if (c.id === chat.id) {
                c.members.push(user);
              }
              return c;
            })
          );
        })
      );
  }

  downloadAttachment(attachment: Attachment): void {
    this.http
      .get(
        `${environment.apiPrefix}/chat/download_attachment/${attachment.id}`,
        { responseType: "blob" }
      )
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = attachment.title;
        link.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
