import { Component } from "@angular/core";
import { DialogService } from "@progress/kendo-angular-dialog";
import { Observable } from "rxjs";
import { NewChatComponent } from "../new-chat/new-chat.component";
import { ChatService } from "../../services/chat.service";
import { Chat } from "../../models/chat.model";
import { User } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: "app-chat-list",
  templateUrl: "./chat-list.component.html",
  styleUrls: ["./chat-list.component.scss"],
})
export class ChatListComponent {
  chats: Chat[] = [];

  selectedChat: Observable<Chat | null> = this.chatService.selectedChat;
  selectedUser: Observable<User | null> =
    this.chatService.selectedUser.asObservable();
  selectedModule = this.chatService.selectedModule.asObservable();

  searchTerm: string = "";

  createChatPopupOpen = false;

  constructor(
    private chatService: ChatService,
    private dialogService: DialogService,
    private authService: AuthService
  ) {
    this.chatService.filteredChats.subscribe((chats) => {
      this.chats =
        chats?.sort(
          (a, b) =>
            b.latestMessage.timestamp.getTime() -
            a.latestMessage.timestamp.getTime()
        ) ?? [];
    });
  }

  matchingChats(): Chat[] {
    if (this.searchTerm === "") {
      return this.chats;
    } else {
      const upperCaseSearchTerm = this.searchTerm.toUpperCase();

      return this.chats.filter(
        (chat) =>
          chat
            .getDisplayName(this.authService.user)
            .toUpperCase()
            .indexOf(upperCaseSearchTerm) !== -1
      );
    }
  }

  openNewChatDialog(groupChat: boolean) {
    this.createChatPopupOpen = false;
    const dialogRef = this.dialogService.open({
      title: groupChat
        ? $localize`:{popup title when creating a new group chat}:Create New Group`
        : $localize`:{popup title when creating a new 1-to-1 chat}:Create New Chat`,
      content: NewChatComponent,
      width: 500,
      height: 400,
    });

    const newChatComponent = dialogRef.content.instance as NewChatComponent;
    newChatComponent.forGroupChat = groupChat;

    // adapted from https://www.telerik.com/forums/possibility-to-remove-%27x%27-for-dialog-closing#4314023
    setTimeout(() => {
      dialogRef.dialog.instance.dialog.nativeElement.querySelector(
        ".k-window-titlebar-actions"
      ).style.display = "none";
    }, 0);
  }

  selectChat(chat: Chat) {
    this.chatService.setSelectedChat(chat);
  }

  selectUser(user: User) {
    this.chatService.setSelectedUser(user);
  }
}
