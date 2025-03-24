import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { distinct, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent {
  selectedChat = this.chatService.selectedChat;
  selectedUser = this.chatService.selectedUser;

  constructor(
    private chatService: ChatService,
    activatedRoute: ActivatedRoute,
    router: Router
  ) {
    activatedRoute.paramMap
      .pipe(map((params) => params.get('module')))
      .subscribe(chatService.selectedModule);

    activatedRoute.queryParamMap
      .pipe(
        map((params) => parseInt(params.get('chat') ?? '')),
        switchMap((chatId) => chatService.getChatById(chatId)),
        filter((chat) => chat !== null),
        distinctUntilChanged((previous, current) => previous?.id === current?.id),
        tap((chat) => chatService.setSelectedChat(chat!))
      )
      .subscribe();

    chatService.selectedChatId
      .pipe(
        filter((id) => id !== null),
        tap((id) => {
          router.navigate([], {
            queryParams: { chat: id },
          });
        })
      )
      .subscribe();
  }
}
