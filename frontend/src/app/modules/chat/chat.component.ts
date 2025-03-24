import { Component } from '@angular/core';
import { ChatService } from './services/chat.service';
import {
  EMPTY,
  Observable,
  combineLatest,
  map,
  merge,
  startWith,
  switchMap,
} from 'rxjs';
import { VisibilityService } from 'src/app/shared/services/visibility.service';
import { DrawerItem } from '@progress/kendo-angular-layout';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  selectedChat = this.chatService.selectedChat;
  selectedUser = this.chatService.selectedUser;

  sidebar: Observable<DrawerItem[]> = combineLatest([
    this.chatService.loadAvailableModules(),
    this.chatService.selectedModule,
  ]).pipe(
    map(([modules, selectedModule]) => {
      return [
        {
          text: 'All',
          path: 'chat',
          icon: '',
          child: [],
          selected: selectedModule === null,
        },
        ...modules.map((module) => ({
          text: module,
          path: `chat/${module}`,
          icon: '',
          child: [],
          selected: module === selectedModule,
        })),
      ];
    })
  );

  constructor(
    private chatService: ChatService,
    visibilityService: VisibilityService
  ) {
    visibilityService.visibilityChange
      .pipe(
        startWith(true),
        switchMap((visible) => {
          if (visible) {
            // reload the list of chats and messages if the page is once again visible
            return merge(chatService.loadChats(), chatService.loadMessages());
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe();
  }
}
