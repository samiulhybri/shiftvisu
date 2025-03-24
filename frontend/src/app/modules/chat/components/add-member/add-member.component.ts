import { Component, Input } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { map, switchMap } from 'rxjs';
import { Chat } from '../../models/chat.model';
import { User } from '@app/models/user';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss'],
})
export class AddMemberComponent {
  availableUsers?: User[];
  @Input()
  chat!: Chat;
  searchString = '';

  constructor(private chatService: ChatService) {
    this.chatService
      .loadAvailableUsers()
      .pipe(
        switchMap((users) => {
          return chatService.getChatById(this.chat.id).pipe(
            map((chat) => {
              if (!chat) {
                return [];
              }
              return users.filter(
                (user) =>
                  chat.members.findIndex(
                    (member) => member.id === user.id
                  ) === -1
              );
            })
          );
        })
      )
      .subscribe((users) => {
        this.availableUsers = users;
      });
  }

  matchingUsers(): User[] {
    if (!this.availableUsers) {
      return [];
    }

    if (this.searchString === '') {
      return this.availableUsers;
    } else {
      const upperCaseSearchString = this.searchString.toUpperCase();

      return this.availableUsers.filter(
        (user) => user.name!.toUpperCase().indexOf(upperCaseSearchString) !== -1
      );
    }
  }

  selectUser(user: User) {
    this.chatService.addUserToChat(this.chat, user).subscribe();
  }
}
