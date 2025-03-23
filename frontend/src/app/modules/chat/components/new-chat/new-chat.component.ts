import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { DialogContentBase, DialogRef } from "@progress/kendo-angular-dialog";
import { ChatService } from "../../services/chat.service";
import { MultiSelectComponent } from "@progress/kendo-angular-dropdowns";
import { User } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: "app-new-chat",
  templateUrl: "./new-chat.component.html",
  styleUrls: ["./new-chat.component.scss"],
})
export class NewChatComponent extends DialogContentBase implements OnInit {
  groupChatName = "";
  availableUsers?: User[];
  selectedUsers: User[] = [];

  @ViewChild("multiselect", { static: true })
  multiselect!: MultiSelectComponent;

  @Input() forGroupChat!: boolean;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    dialog: DialogRef
  ) {
    super(dialog);
    this.chatService.loadAvailableUsers().subscribe((users) => {
      this.availableUsers = users;
    });
  }

  ngOnInit(): void {
    this.multiselect.toggle(true);
  }

  onValueChange(value: User[]) {
    if (!this.forGroupChat) {
      this.chatService.setSelectedUser(value[0]);
      this.dialog.close();
    }
  }

  removeUser(user: User) {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
  }

  displayUsers(): User[] {
    const usersWithChats = new Set(
      this.chatService.allChats
        .value!.filter((chat) => !chat.isGroupChat)
        .map((chat) => chat.getPartner(this.authService.user).id)
    );
    return (
      this.availableUsers?.filter(
        (user) => this.forGroupChat || !usersWithChats.has(user.id)
      ) ?? []
    );
  }

  createGroupChat() {
    this.chatService
      .createGroupChat(
        this.selectedUsers.map((user) => user.id),
        this.groupChatName
      )
      .subscribe();
    this.dialog.close();
  }

  closeDialog() {
    this.dialog.close();
  }
}
