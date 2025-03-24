import { Component, OnInit, ViewChild } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { ChatService } from "../../services/chat.service";
import { Attachment, Message } from "../../models/message.model";
import { ExecuteActionEvent } from "@progress/kendo-angular-conversational-ui";
import { Chat } from "../../models/chat.model";
import { TextAreaComponent } from "@progress/kendo-angular-inputs";
import { User } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";
import { ReadByUserStatus } from "@app/enums/message-read-status.enum";

@Component({
  selector: "app-chat-detail",
  templateUrl: "./chat-detail.component.html",
  styleUrls: ["./chat-detail.component.scss"],
})
export class ChatDetailComponent implements OnInit {
  selectedChat: Chat | null = null;
  /// The selected user is only set if we are currently viewing a user, but the chat hasn't been started yet.
  selectedUser: User | null = null;

  // The currently logged in user
  user: User;

  showChatMembers = false;

  isLoadingMessages = false;

  messages!: Observable<Message[]>;

  // Used to detect scroll direction
  private previousScrollTop = 0;

  // For custom message box implementation:
  @ViewChild("messageBoxInput", { static: false })
  public messageBoxInput!: TextAreaComponent;
  public messageBoxInnerInputFocus = false;

  editingMessages: Set<number> = new Set();
  messageWithPopupOpen: number | null = null;

  messageAttachments: File[] = [];

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {
    this.user = authService.user;
    this.chatService.selectedChat.subscribe((chat) => {
      this.previousScrollTop = 0;
      if (chat?.id !== this.selectedChat?.id) {
        this.showChatMembers = false;
      }
      this.selectedChat = chat;
    });
    this.chatService.selectedUser.subscribe((user) => {
      if (user) {
        this.showChatMembers = false;
      }
      this.selectedUser = user;
    });
  }

  ngOnInit() {
    const observer = new IntersectionObserver(
      (entries, observer) => this.onIntersection(entries, observer),
      {
        root: document.getElementsByClassName("k-message-list").item(0),
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    this.messages = this.chatService.messages.asObservable().pipe(
      map((messages) => {
        // reverse messages so that the newest messages are at the bottom
        return messages.slice().reverse();
      }),
      tap((messages) => {
        // wait for the DOM to update
        setTimeout(() => {
          // observe messages to mark them as read when they are visible

          // remove all previous observers
          observer.disconnect();
          // add new observers
          messages.forEach((message) => {
            if (
              !message.getIsIncoming(this.authService.user) ||
              message.readByUser !== ReadByUserStatus.unread
            )
              return;
            const element = document.getElementById(`message-${message.id}`);
            if (element) {
              observer.observe(element);
            }
          });
        }, 0);
        document
          .getElementsByClassName("k-message-list")
          .item(0)
          ?.addEventListener("scroll", (event) => this.onScrolled(event));
      })
    );
  }

  getChatDisplayName(): string | undefined {
    return (
      this.selectedChat?.getDisplayName(this.authService.user) ??
      this.selectedUser?.name
    );
  }

  getChatSubtitle(): string | undefined {
    return (
      this.selectedChat?.getPartner(this.authService.user)?.email ??
      this.selectedUser?.email
    );
  }

  getIsIncoming(message: Message): boolean {
    return message.getIsIncoming(this.authService.user);
  }

  onIntersection(
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const message = entry.target as HTMLElement;
        const messageId = parseInt(message.id.split("-")[1]);
        observer.unobserve(message);
        this.chatService.markMessageAsRead(messageId).subscribe();
      }
    });
  }

  deleteMessage(message: Message) {
    this.chatService.deleteMessage(message).subscribe();
  }

  beginEditingMessage(message: Message) {
    this.editingMessages.add(message.id!);
    this.messageWithPopupOpen = null;
    // wait for the DOM to update
    setTimeout(() => {
      const element = document.getElementById(`message-${message.id}`)!;
      element.focus();
      this.resizeTextInputToFit(element);
    }, 0);
  }

  public onMessageEditKeyDown(e: KeyboardEvent, message: Message): void {
    if (this.isEnterOnly(e)) {
      e.preventDefault();
      this.finishEditingMessage(message);
    }
  }

  public finishEditingMessage(message: Message) {
    const element = document
      .getElementById(`message-${message.id}`)
      ?.children.item(0) as HTMLTextAreaElement;

    const newText = element?.value?.trim();

    if (!newText && message.attachments.length === 0) {
      // Reject empty messages.
      return;
    }

    this.editingMessages.delete(message.id!);

    if (newText === message.text) {
      // The message text has not changed, no need to update.
      return;
    }

    this.chatService.editMessage(message, newText).subscribe();
  }

  public cancelEditingMessage(message: Message) {
    this.editingMessages.delete(message.id!);

    const element = document.getElementById(`message-${message.id}`)!;

    element.innerText = message.text;
  }

  public onInputFocus(): void {
    this.messageBoxInnerInputFocus = true;
  }

  public onInputBlur(): void {
    this.messageBoxInnerInputFocus = false;
  }

  public clearValue(): void {
    if (!this.messageBoxInnerInputFocus) {
      this.messageBoxInput.value = "";
      this.messageBoxInput.focus();
      this.messageBoxInnerInputFocus = true;
    }
  }

  private isEnterOnly(e: KeyboardEvent): boolean {
    return e.keyCode === 13 && !(e.shiftKey || e.metaKey || e.ctrlKey);
  }

  public onKeyDown(e: KeyboardEvent): void {
    if (this.isEnterOnly(e) && this.messageBoxInnerInputFocus) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  public resizeTextInputToFit(target: HTMLElement): void {
    // Remove the previously set height to be able to shrink the textarea.
    target.style.height = "";
    // Set the height to match the scrollHeight, so that the textarea expands as more lines of text are added.
    target.style.height = target.scrollHeight + "px";
  }

  public onAction(e: ExecuteActionEvent): void {
    this.messageBoxInput.focus();
  }

  sendMessage() {
    const messageBox = this.messageBoxInput;
    const message = messageBox.value?.trim() ?? "";
    if (!message && this.messageAttachments.length === 0) {
      // Do not send empty messages.
      return;
    }
    const attachments = this.messageAttachments;
    this.messageAttachments = [];
    messageBox.value = "";
    messageBox.focus();
    if (this.selectedChat) {
      this.chatService
        .sendMessage(this.selectedChat, message, attachments)
        .subscribe(() => {
          const listView = document.getElementById("messages-list");

          if (listView) {
            listView.scrollTo(0, listView.scrollHeight);
          }
        });
    } else if (this.selectedUser) {
      this.chatService
        .createChat(this.selectedUser, message, attachments)
        .subscribe();
    }
  }

  toggleChatMembers() {
    if (this.selectedChat?.isGroupChat) {
      this.showChatMembers = !this.showChatMembers;
    }
  }

  onScrolled(event: Event) {
    if (this.isLoadingMessages) {
      return;
    }
    const listView = event.target as HTMLElement;

    // only load more messages if the user is scrolling up
    if (listView.scrollTop >= this.previousScrollTop) {
      this.previousScrollTop = listView.scrollTop;
      return;
    }
    this.previousScrollTop = listView.scrollTop;

    if (listView.scrollTop < 150) {
      this.isLoadingMessages = true;
      const oldScrollHeight = listView.scrollHeight;
      // request an animation frame to avoid jank.
      window.requestAnimationFrame(() => {
        this.chatService.loadMoreMessages().subscribe(() => {
          // request an animation frame to wait for the DOM to update.
          window.requestAnimationFrame(() => {
            // scroll back down to avoid "jumps" in the UI
            listView.scrollTo({
              left: 0,
              top: listView.scrollHeight - oldScrollHeight + listView.scrollTop,
              behavior: "instant" as ScrollBehavior,
            });
            this.isLoadingMessages = false;
          });
        });
      });
    }
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    this.messageAttachments.push(...Array.from(input.files));
  }

  removeFile(file: File) {
    this.messageAttachments = this.messageAttachments.filter((f) => f !== file);
  }

  downloadAttachment(attachment: Attachment) {
    this.chatService.downloadAttachment(attachment);
  }

  onPasted(e: ClipboardEvent) {
    if (e.clipboardData?.files?.length) {
      e.preventDefault();
      this.messageAttachments.push(...Array.from(e.clipboardData.files));
    }
  }

  onDrop(e: DragEvent) {
    if (e.dataTransfer?.files?.length) {
      e.preventDefault();
      this.messageAttachments.push(...Array.from(e.dataTransfer.files));
    }
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
  }
}
