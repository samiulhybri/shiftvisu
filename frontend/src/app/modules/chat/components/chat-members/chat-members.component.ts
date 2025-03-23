import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ChatService } from "../../services/chat.service";
import { Chat } from "../../models/chat.model";
import { User } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: "app-chat-members",
  templateUrl: "./chat-members.component.html",
  styleUrls: ["./chat-members.component.scss"],
})
export class ChatMembersComponent {
  @Input()
  chat!: Chat;

  @Output()
  closePanel = new EventEmitter<void>();

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  chatPartners(): User[] {
    return this.chat.members.filter(
      (member) => member.id !== this.authService.user.id
    );
  }

  leaveChat() {
    this.chatService.leaveChat(this.chat).subscribe();
  }

  removeUser(user: User) {
    this.chatService.removeUserFromChat(this.chat, user).subscribe();
  }
}
