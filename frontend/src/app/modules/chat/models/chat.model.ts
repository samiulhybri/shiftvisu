import { User } from "@app/models/user";
import { MessageDto, Message } from "./message.model";
import { CopyWith } from "./copy_with";

export interface ChatDto {
  id: number;
  users: User[];
  name: string | null;
  latest_message: MessageDto;
  unread_messages_count: number;
  is_group_chat: boolean;
  is_managed_chat: boolean;
  associated_module: string | null;
}

export class Chat extends CopyWith {
  constructor(
    readonly id: number,
    readonly chatName: string | null,
    readonly members: User[],
    readonly isGroupChat: boolean,
    readonly isManagedChat: boolean,
    readonly latestMessage: Message,
    readonly unreadMessagesCount: number,
    readonly module: string | null
  ) {
    super();
  }

  public getPartner(user: User): User {
    return this.members[0].id === user.id ? this.members[1] : this.members[0];
  }

  public getDisplayName(user: User):string {
    return this.chatName ?? this.getPartner(user).name!;
  }

  static fromDto(dto: ChatDto): Chat {
    return new Chat(
      dto.id,
      dto.name,
      dto.users,
      dto.is_group_chat,
      dto.is_managed_chat,
      Message.fromDto(dto.latest_message),
      dto.unread_messages_count,
      dto.associated_module
    );
  }

  static isChat(userOrChat: Chat | User): userOrChat is Chat {
    return "latestMessage" in userOrChat;
  }
}

export interface PaginationDto<T> {
  next_cursor: string | null;
  data: T[];
}

export interface CreateChatDto {
  chat: ChatDto;
  message: MessageDto;
}
