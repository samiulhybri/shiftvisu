import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewChild,
} from "@angular/core";
import { Message } from "@app/shared/models/message.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { Chat } from "@app/shared/models/chat.model";
import { Localization } from "@app/shared/utils/common-localize";

@Component({
	selector: "app-chat",
	templateUrl: "./chat.component.html",
	styleUrl: "./chat.component.css",
})
export class ChatComponent implements AfterViewInit, OnChanges {
	@ViewChild("messageContainerRef") private messageContainer!: ElementRef;
	@ViewChild("messageTextarea", { static: false }) messageTextareaRef!: ElementRef;

	@Input({ required: true }) public modelId: number = 0;
	@Input({ required: true }) public modelName: string = "";
	@Input({ required: true }) public chat: any;
	@Input() customClass: string = "";

	@Output() closeDialog = new EventEmitter<any>();
	@Output() refreshGridTable = new EventEmitter<any>();

	private userNearBottom: boolean = true;
	groupedNotes: NoteGroup[] = [];

	selectedMessage: Message | undefined;
	showPopOver = false;
	opener: string = "";
	previewImagesData: string[] = [];
	public uploadedFiles: any = [];
	fileArr: NoteGroup[] = [];
	newNote: string = "";
	notes: Message[] = [];

	msgInputMaxHeight = 150;
	msgInputIsScrollable = false;

	previewImages: File[] = [];

	isEditMessage = false;

	localizedEditText = Localization.edit;
	localizedDeleteText = Localization.delete;
	localization = Localization;
	media: any[] = [];

	isChatLoading: boolean = false;

	constructor(
		public authService: AuthService,
		private commonService: CommonService
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["modelId"]?.currentValue && changes["chat"]) {
			this.isChatLoading = true;
			this.commonService.get("get-customer-data/" + this.chat.id, false).subscribe({
				next: (response: any) => {
					this.chat.messages = response;
					this.notes = response;
					this.groupNotesByDate();
					this.isChatLoading = false;
				},
				error: error => {
					this.isChatLoading = false;
				},
			});
		}
	}

	ngAfterViewInit(): void {
		// Check if user is near the bottom before scrolling
		if (this.userNearBottom) {
			this.scrollToBottom();
		}
	}

	isUserNearBottom(): boolean {
		const threshold = 1; // Adjust this threshold as needed
		const position =
			this.messageContainer.nativeElement.scrollTop +
			this.messageContainer.nativeElement.offsetHeight;
		const height = this.messageContainer.nativeElement.scrollHeight;
		return position > height - threshold;
	}

	// Listen to scroll events
	onScroll() {
		this.userNearBottom = this.isUserNearBottom();
	}

	formattedNote(text: string | undefined): string {
		// Replace new line characters (\n) with <br> for display in HTML
		return text ? text.replace(/\n/g, "<br>") : "";
	}

	openInNewTab(url: string | undefined): void {
		if (url) {
			const windowFeatures = "width=800,height=600,top=100,left=100,resizable,scrollbars";
			window.open(url, "_blank", windowFeatures);
		}
	}

	onShowPopup(note: Message) {
		this.selectedMessage = note;

		this.showPopOver = false;
		this.opener = note.created_at?.toString() + note.id;

		setTimeout(() => {
			this.showPopOver = true;
		}, 100);
	}

	onFileChange(e: any) {
		e.preventDefault();
		const files = e.detail.files;
		this.uploadNewFiles(files);
	}

	uploadNewFiles(files: any) {
		const validFiles: File[] = [];
		const invalidFiles: string[] = [];
		this.uploadedFiles = [];

		for (let i = 0; i < files.length; i++) {
			validFiles.push(files[i]);
		}

		if (validFiles.length > 0) this.processFiles(validFiles);
	}

	public async processFiles(files: any[]) {
		for (let i = 0; i < files.length; i++) {
			const fileName = files[i].name.replace(/\.[^/.]+$/, "");
			const fileAlreadyExists = this.fileArr.some((f: any) => f.name === fileName);

			files[i].updated_at = new Date();
			if (!fileAlreadyExists) this.uploadedFiles.push(files[i]);
		}

		await this.uploadTempFiles();
	}

	uploadTempFiles(): Promise<void> {
		return new Promise((resolve, reject) => {
			let count = 0;

			this.uploadedFiles.forEach((file: any, index: number) => {
				const newNote = new Message().deserialize({
					sender: this.authService.loggedInUser || {},
					content: this.newNote,
					chat: this.chat,
				});
				this.commonService.post("Messages", newNote.toOdata()).subscribe({
					next: (newMessage: any) => {
						const formData = new FormData();
						formData.append("id", newMessage?.id + "");
						formData.append("model", "Message");
						formData.append("media", file);

						this.commonService.post("media/upload", formData, false).subscribe({
							next: (res: any) => {
								count++;

								newNote.id = newMessage?.id;
								newNote.media = res;
								this.notes.push(newNote);
								this.groupNotesByDate();

								if (count === this.uploadedFiles.length) {
									resolve();
								}
							},
							error: err => {
								count++;
								console.error("upload file error: ", err);
								if (count === this.uploadedFiles.length) reject(err);
							},
						});
						this.refreshGridTable.emit(newMessage);
					},
					error: (error: Error) => {
						console.error(error);
					},
				});
			});
		});
	}

	// Function to group notes by the date
	groupNotesByDate() {
		const grouped = this.notes.reduce((groups: any, note: Message) => {
			const date = new Date(note.created_at).toDateString();
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(note);
			return groups;
		}, {});

		// Convert the grouped object into an array of objects, sort by date, and sort notes within each date
		this.groupedNotes = Object.keys(grouped)
			.map(date => ({
				date: new Date(date),
				notes: grouped[date].sort(
					(a: Message, b: Message) =>
						new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
				),
			}))
			.sort((a, b) => a.date.getTime() - b.date.getTime());

		this.scrollToBottom();
	}

	handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault(); // Prevent form submission
			this.scrollToBottom();
			if (this.previewImages.length > 0) {
				this.uploadNewFiles([...this.previewImages]);
				this.previewImages = [];
				this.previewImagesData = [];
			}
			this.addNote();
		}
	}

	// Function to scroll to the bottom
	scrollToBottom(): void {
		setTimeout(() => {
			if (this.messageContainer) {
				this.messageContainer.nativeElement.scrollTop =
					this.messageContainer.nativeElement.scrollHeight;
			}
		}, 0);
	}

	addNote() {
		if (!this.chat?.id) {
			const payload = new Chat().deserialize({});
			this.commonService.post("Chats", payload.toOdata()).subscribe({
				next: (newChat: any) => {
					this.commonService
						.put(`${this.modelName}(${this.modelId})`, { chat_id: newChat.id })
						.subscribe({
							next: (responseModel: any) => {
								this.createNewMessage();
							},
							error: error => {},
						});
				},
				error: (error: Error) => {
					console.error(error);
				},
			});
		} else {
			this.createNewMessage();
		}

		this.resetChatInputStyle();
	}

	createNewMessage() {
		if (this.newNote.trim()) {
			if (this.isEditMessage) {
				const payload = new Message().deserialize(this.selectedMessage);
				payload.content = this.newNote;

				this.notes = this.notes.map((note: Message) => {
					if (note.id == this.selectedMessage?.id) {
						note.content = this.newNote;

						return note;
					} else return note;
				});

				this.groupNotesByDate(); // Group notes by date after adding a new note
				this.newNote = ""; // Clear the message input field

				this.commonService.put(`Messages(${payload.id})`, payload.toOdata()).subscribe({
					next: () => {},
					error: (error: Error) => {
						console.error(error);
					},
				});
			} else {
				const newNote = new Message().deserialize({
					sender: this.authService.loggedInUser || {},
					content: this.newNote,
					chat: this.chat,
				});
				this.notes.push(newNote);
				this.groupNotesByDate(); // Group notes by date after adding a new note
				this.newNote = ""; // Clear the message input field

				if (newNote.chat?.id) {
					this.commonService.post("Messages", newNote.toOdata()).subscribe({
						next: (res: any) => {
							newNote.id = res.id;
							newNote.sender = this.authService.loggedInUser;
							this.refreshGridTable.emit(newNote);

							if (!this.chat?.messages?.length) {
								this.chat?.messages.push(newNote);
							}
						},
						error: (error: Error) => {
							console.error(error);
						},
					});
				} else this.refreshGridTable.emit(newNote);
			}
		}

		this.isEditMessage = false;
	}

	resetChatInputStyle() {
		this.msgInputMaxHeight = 150;
		this.msgInputIsScrollable = false;
		this.messageTextareaRef.nativeElement.style.height = "auto";
	}

	onInputMessage(event: Event) {
		const textarea = event.target as HTMLTextAreaElement;
		this.adjustTextareaHeight(textarea);
	}

	adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
		// Reset height to auto to calculate the scrollHeight properly
		textarea.style.height = "auto";

		// Get the scrollHeight of the content
		const scrollHeight = textarea.scrollHeight;

		// Update the height of the textarea based on the content
		if (scrollHeight <= this.msgInputMaxHeight) {
			textarea.style.height = `${scrollHeight}px`;
			this.msgInputIsScrollable = false;
		} else {
			textarea.style.height = `${this.msgInputMaxHeight}px`;
			this.msgInputIsScrollable = true;
		}
	}

	onPaste(event: any) {
		const clipboardItems = event.clipboardData?.items || [];
		for (const item of clipboardItems) {
			if (item.type.startsWith("image/")) {
				const blob = item.getAsFile();
				if (blob) {
					this.previewImages.push(blob);
					const reader = new FileReader();
					reader.onload = () => {
						// Store the preview image URL
						this.previewImagesData.push(reader.result as string);
					};
					reader.readAsDataURL(blob);
				}
			}
		}
	}

	onclickSendMessage(e: any) {
		e.preventDefault();
		this.scrollToBottom();
		if (this.previewImages.length > 0) {
			this.uploadNewFiles([...this.previewImages]);
			this.previewImages = [];
			this.previewImagesData = [];
		}
		this.addNote();
	}

	removeImagePreview(index: number): void {
		this.previewImagesData.splice(index, 1);
		this.previewImages.splice(index, 1);
	}

	popOverClose() {
		this.showPopOver = false;
		this.opener = "";
	}

	editMessage(e: any) {
		this.newNote = this.selectedMessage?.content || "";
		this.isEditMessage = true;
		this.showPopOver = false;

		this.messageTextareaRef.nativeElement.focus();
		this.messageTextareaRef.nativeElement.value = this.newNote;
		this.adjustTextareaHeight(this.messageTextareaRef.nativeElement);
	}

	deleteMessage(e: any) {
		this.chat!.messages =
			this.chat?.messages?.filter(
				(message: Message) => this.selectedMessage?.id != message.id
			) || [];

		this.notes = this.chat!.messages;

		this.groupedNotes = this.groupedNotes
			.map(group => ({
				...group,
				notes: group.notes.filter(note => note.id !== this.selectedMessage?.id),
			}))
			.filter(group => group.notes.length > 0); // Remove any empty groups

		this.showPopOver = false;

		this.commonService.delete(`Messages(${this.selectedMessage?.id})`).subscribe({
			next: () => {},
			error: (error: Error) => {
				console.error(error);
			},
		});
	}

	onCloseClick() {
		this.closeDialog.emit();
	}
}

interface NoteGroup {
	date: Date;
	notes: Message[];
}
