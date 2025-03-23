import {
  Message as KendoMessage,
  Attachment as KendoAttachment,
} from "@progress/kendo-angular-conversational-ui";
import { User } from "@app/models/user";
import { ReadByUserStatus } from "@app/enums/message-read-status.enum";
import { ChatAction } from "@app/enums/chat-action.enum";
import { CopyWith } from "./copy_with";

export interface MessageDto {
  id: number;
  sender_user_id: number | null;
  content: string;
  read_by_all: boolean;
  read_by_user: boolean | null;
  created_at: string;
  content_was_truncated: boolean;
  chat_action?: string;
  media: AttachmentDto[];
}

export class Message extends CopyWith implements KendoMessage {
  constructor(
    readonly id: number | null,
    readonly senderUserId: number | null,
    readonly author: User,
    readonly text: string,
    readonly readByUser: ReadByUserStatus,
    readonly readByAll: boolean,
    readonly timestamp: Date,
    readonly chatAction: ChatAction | null,
    readonly attachments: Attachment[],
    readonly typing: boolean = false,
  ) {
    super();
  }

  public getIsIncoming(user: User): boolean {
    return this.senderUserId !== user.id;
  }

  static fromDto(dto: MessageDto): Message {
    const author = new User();
    author.id = dto.sender_user_id!;

    const readStatus =
      dto.read_by_user === null
        ? ReadByUserStatus.noStatus
        : dto.read_by_user
        ? ReadByUserStatus.read
        : ReadByUserStatus.unread;

    const m = new Message(
      dto.id,
      dto.sender_user_id,
      author,
      dto.content,
      readStatus,
      dto.read_by_all,
      new Date(dto.created_at),
      dto.chat_action ? (dto.chat_action as ChatAction) : null,
      dto.media.map(Attachment.fromDto)
    );

    return m;
  }
}

export interface AttachmentDto {
  id: number;
  name: string;
  mime_type: string;
}

export class Attachment implements KendoAttachment {
  constructor(
    readonly id: number,
    readonly title: string,
    readonly contentType: string,
    readonly content: string = ""
  ) {}

  static fromDto(dto: AttachmentDto): Attachment {
    return new Attachment(dto.id, dto.name, dto.mime_type);
  }
}
