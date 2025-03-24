import { Component, Input } from "@angular/core";
import { Chat } from "../../models/chat.model";
import { User } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: "app-chat-avatar",
  templateUrl: "./chat-avatar.component.html",
  styleUrls: ["./chat-avatar.component.scss"],
})
export class ChatAvatarComponent {
  @Input() chat!: Chat | User;

  constructor(private authService: AuthService) {}

  get initials(): string {
    const names = (
      this.chat instanceof Chat
        ? this.chat.getDisplayName(this.authService.user)
        : this.chat.name!
    )!.split(" ");
    return names.map((n) => n[0]).join("");
  }
}
