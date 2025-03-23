import {  MessageDto } from './message.model';

export interface MessageSentDto {
  message: MessageDto;
  chat_id: number;
}

export interface MessageReadDto {
  message_id: number;
  chat_id: number;
  receiver_user_id: number;
}

export interface MessageEditedDto {
  message: MessageDto;
  chat_id: number;
}

export class MessageSent {
  constructor(readonly message: MessageDto, readonly chatId: number) {}

  static fromDto(dto: MessageSentDto): MessageSent {
    return new MessageSent(dto.message, dto.chat_id);
  }
}

export class MessageRead {
  constructor(
    readonly messageId: number,
    readonly chatId: number,
    readonly receiverUserId: number
  ) {}

  static fromDto(dto: MessageReadDto): MessageRead {
    return new MessageRead(dto.message_id, dto.chat_id, dto.receiver_user_id);
  }
}
