import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddMemberComponent } from './components/add-member/add-member.component';
import { ChatUserTileComponent } from './components/chat-user-tile/chat-user-tile.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { SharedModule } from '../../shared/shared.module';
import { ChatComponent } from './chat.component';
import { ChatRoutingModule } from './chat-routing.module';
import {
  ChatDetailComponent,
  ChatListComponent,
  ChatMembersComponent,
  ChatPageComponent,
  NewChatComponent,
} from './components';
import { ChatAvatarComponent } from './components/chat-avatar/chat-avatar.component';

@NgModule({
  declarations: [
    ChatDetailComponent,
    ChatListComponent,
    ChatComponent,
    NewChatComponent,
    ChatUserTileComponent,
    ChatMembersComponent,
    AddMemberComponent,
    ChatPageComponent,
    ChatAvatarComponent,
  ],
  providers: [],
  imports: [CommonModule, DialogsModule, SharedModule, ChatRoutingModule],
})
export class ChatModule {}
