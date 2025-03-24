import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Chat } from "../../models/chat.model";
import { User } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: "app-user-chat-tile",
  templateUrl: "./chat-user-tile.component.html",
  styleUrls: ["./chat-user-tile.component.scss"],
})
export class ChatUserTileComponent {
  @Input() userOrChat!: User | Chat;
  @Input() selected = false;
  @Output() selectUserOrChat: EventEmitter<void> = new EventEmitter();

  constructor(private authService: AuthService) {}

  getChatName(): string {
    return this.userOrChat instanceof User
      ? this.userOrChat.name!
      : this.userOrChat.getDisplayName(this.authService.user);
  }

  isChat(userOrChat: Chat | User): userOrChat is Chat {
    return Chat.isChat(userOrChat);
  }

  formatDate(dateTime: Date): string {
    const now = new Date();

    if (
      now.getFullYear() === dateTime.getFullYear() &&
      now.getMonth() === dateTime.getMonth() &&
      now.getDate() === dateTime.getDate()
    ) {
      return dateTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return dateTime.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
}
