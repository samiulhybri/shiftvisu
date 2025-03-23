import {
	AfterViewChecked,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	ViewChild,
} from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { Customer } from "@app/shared/models/customer.model";
import { EmployeeClassification } from "@app/shared/models/employee-classification.model";
import { MachineClassification } from "@app/shared/models/machine-classification.model";
import { MarketSegment } from "@app/shared/models/market-segment.model";
import { Message } from "@app/shared/models/message.model";
import { PotentialClassification } from "@app/shared/models/potential-classification.model";
import { RevenueClassification } from "@app/shared/models/revenue-classification.model";
import { SalesStatus } from "@app/shared/models/sales-status.model";
import { User } from "@app/shared/models/user.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { Chat } from "@app/shared/models/chat.model";
import { Localization } from "@app/shared/utils/common-localize";
import { DatePipe } from "@angular/common";
import { CustomerCategory } from "@app/shared/models/customer-category.model";
import { CrmActionLogsComponent } from "@app/modules/crm/crm-action-logs/crm-action-logs.component";

interface NoteGroup {
	date: Date;
	notes: Message[];
}

@Component({
	selector: "app-overview",
	templateUrl: "./overview.component.html",
	styleUrl: "./overview.component.css",
})
export class OverviewComponent implements AfterViewChecked {
	@Input() public selectedCustomer!: Customer;
	@Input() public revenueClassifications: RevenueClassification[] = [];
	@Input() public machineClassifications: MachineClassification[] = [];
	@Input() public employeeClassifications: EmployeeClassification[] = [];
	@Input() public potentialClassifications: PotentialClassification[] = [];
	@Input() public marketSegments: MarketSegment[] = [];
	@Input() public userList: User[] = [];
	@Input() public salesStatuses: SalesStatus[] = [];
	@Input() public category: CustomerCategory[] = [];
	@Input() public createOrUpdateForm: any;
	@Input() public nameText: string = "";
	@Input() public childComponentGrid!: CustomReactGridTable;
	@Output() refreshGridTable = new EventEmitter<any>();

	@ViewChild("messageContainer") private messageContainer!: ElementRef;
	@ViewChild("fileUploader", { static: false }) fileUploader!: ElementRef;
	@ViewChild("crmActionLogs") crmActionLogsComponent?: CrmActionLogsComponent;

	@ViewChild("messageTextarea", { static: false }) messageTextareaRef!: ElementRef;
	msgInputMaxHeight = 150;
	msgInputIsScrollable = false;
	previewImagesData: string[] = [];
	previewImages: File[] = [];

	constructor(
		public authService: AuthService,
		public commonService: CommonService,
		private _datePipe: DatePipe
	) {}

	notes: Message[] = [];
	groupedNotes: NoteGroup[] = [];
	public uploadedFiles: any = [];
	fileArr: NoteGroup[] = [];
	username: string = "";
	newNote: string = "";
	selectedMessage: Message | undefined;
	opener = "";
	showPopOver = false;
	isEditMessage = false;
	localizedEditText = Localization.edit;
	localizedDeleteText = Localization.delete;

	// Variable to track if user is near the bottom of the chat
	private userNearBottom: boolean = true;

	ngAfterViewChecked() {
		// Check if user is near the bottom before scrolling
		if (this.userNearBottom) {
			this.scrollToBottom();
		}
		this.notes = this.selectedCustomer.chat?.messages || [];
	}

	// Function to scroll to the bottom
	scrollToBottom(): void {
		try {
			if (this.messageContainer) {
				this.messageContainer.nativeElement.scrollTop =
					this.messageContainer.nativeElement.scrollHeight;
			}
		} catch (err) {
			console.error("Error while scrolling:", err);
		}
	}

	// Function to check if the user is near the bottom of the chat
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

	onFileChange(e: any) {
		e.preventDefault();
		const files = e.detail.files;
		this.uploadNewFiles(files);
	}

	onPaste(event: any) {
		const clipboardItems = event.clipboardData?.items || [];
		for (const item of clipboardItems) {
			if (item.type.startsWith('image/')) {
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

	removeImagePreview(index: number): void {
		this.previewImagesData.splice(index, 1);
		this.previewImages.splice(index, 1);
	}

	onInputMessage(event: Event) {
		const textarea = event.target as HTMLTextAreaElement;
		this.adjustTextareaHeight(textarea);
	}
	
	adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
		// Reset height to auto to calculate the scrollHeight properly
		textarea.style.height = 'auto';

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

	resetChatInputStyle() {
		this.msgInputMaxHeight = 150;
		this.msgInputIsScrollable = false;
		this.messageTextareaRef.nativeElement.style.height = 'auto';
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
					chat: this.selectedCustomer.chat,
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

	onChangeUser(event: any) {
		if (this.userList) {
			this.selectedCustomer.responsibleUser = new User().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onUpdateDate(e: any) {
		this.selectedCustomer.date_follow_up = e.target.value;
	}

	onChangeSalesStatus(event: any) {
		if (this.salesStatuses) {
			this.selectedCustomer.salesStatus = new SalesStatus().deserialize({
				custom_id: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeRevenueClassification(event: any) {
		if (this.revenueClassifications) {
			this.selectedCustomer.revenueClassification = new RevenueClassification().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}
	

	onChangeMachineClassification(event: any) {
		if (this.machineClassifications) {
			this.selectedCustomer.machineClassification = new MachineClassification().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeEmployeeClassification(event: any) {
		if (this.employeeClassifications) {
			this.selectedCustomer.employeeClassification = new EmployeeClassification().deserialize(
				{
					name: (event.target as any).value,
					id: parseInt((event.detail as any).item.id),
				}
			);
		}
	}

	onChangeMarketSegment(event: any) {
		if (this.marketSegments) {
			this.selectedCustomer.marketSegment = new MarketSegment().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
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

	addNote() {
		if (!this.selectedCustomer.chat?.id) {
			const payload = new Chat().deserialize({});
			this.commonService.post("Chats", payload.toOdata()).subscribe({
				next: (newChat: any) => {
					this.commonService
						.put(`Customers(${this.selectedCustomer?.id})`, { chat_id: newChat.id })
						.subscribe({
							next: (updatedCustomers: any) => {
								this.selectedCustomer = new Customer().deserialize(
									updatedCustomers
								);
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
					chat: this.selectedCustomer.chat,
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

							if (!this.selectedCustomer.chat?.messages?.length) {
								this.selectedCustomer.chat?.messages.push(newNote);
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

	onProgressChanged(e: any) {
		e.preventDefault();
		this.selectedCustomer.progress = e.target.value;
	}

	onUserInputChange(event: any) {
		const inputValue = event.target.value;
		const matchUserData = this.userList.find(user => user.name === inputValue);
		if (!matchUserData && this.selectedCustomer?.country) {
			this.selectedCustomer.responsibleUser = new User().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onSalesStatusInputChange(event: any) {
		const inputValue = event.target.value;
		const matchSalesStatusData = this.salesStatuses.find(
			status => status.custom_id === inputValue
		);
		if (!matchSalesStatusData && this.selectedCustomer?.salesStatus) {
			this.selectedCustomer.salesStatus = new SalesStatus().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onRevenueClassificationInputChange(event: any) {
		const inputValue = event.target.value;
		const matchData = this.revenueClassifications.find(
			classification => classification.name === inputValue
		);
		if (!matchData && this.selectedCustomer?.revenueClassification) {
			this.selectedCustomer.revenueClassification = new RevenueClassification().deserialize({
				id: null,
				name: "",
			});
		}
	}
	
	onMachineClassificationInputChange(event: any) {
		const inputValue = event.target.value;
		const matchData = this.machineClassifications.find(
			classification => classification.name === inputValue
		);
		if (!matchData && this.selectedCustomer?.machineClassification) {
			this.selectedCustomer.machineClassification = new MachineClassification().deserialize({
				id: null,
				name: "",
			});
		}
	}
	
	onEmployeeClassificationInputChange(event: any) {
		const inputValue = event.target.value;
		const matchData = this.employeeClassifications.find(
			classification => classification.name === inputValue
		);
		if (!matchData && this.selectedCustomer?.employeeClassification) {
			this.selectedCustomer.employeeClassification = new EmployeeClassification().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onCategoryInputChange(event: any) {
		const inputValue = event.target.value;
		const matchData = this.category.find(
			category => category.name === inputValue
		);
		if (!matchData && this.selectedCustomer?.category) {
			this.selectedCustomer.category = new CustomerCategory().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onChangeCustomerCategory(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.category = new CustomerCategory().deserialize({
				name: (event.target as any).value,
				id: (event.detail as any).item.id,
			});
		}
	}

	onMarketInputChange(event: any) {
		const inputValue = event.target.value;
		const matchData = this.marketSegments.find(segment => segment.name === inputValue);
		if (!matchData && this.selectedCustomer?.marketSegment) {
			this.selectedCustomer.marketSegment = new MarketSegment().deserialize({
				id: null,
				name: "",
			});
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
		this.selectedCustomer.chat!.messages =
			this.selectedCustomer.chat?.messages?.filter(
				(message: Message) => this.selectedMessage?.id != message.id
			) || [];

		this.notes = this.selectedCustomer.chat!.messages;
		
		this.groupedNotes = this.groupedNotes.map(group => ({
			...group,
			notes: group.notes.filter(note => note.id !== this.selectedMessage?.id)
		})).filter(group => group.notes.length > 0); // Remove any empty groups

		this.showPopOver = false;

		this.commonService.delete(`Messages(${this.selectedMessage?.id})`).subscribe({
			next: () => {},
			error: (error: Error) => {
				console.error(error);
			},
		});
	}

	onActionLogCreated(event: any) {
		const createdAt = this._datePipe.transform(new Date(event.created_at), "dd.MM.yyyy, HH:mm");
		const actionName = event.crmAction?.name || "Unknown Action";
		const note = event.note ? `\n \n${event.note}` : "";

		const messageContent = `${createdAt} - ${actionName}${note}`;
		if (!this.selectedCustomer.chat?.id) {
			const payload = new Chat().deserialize({});
			this.commonService.post("Chats", payload.toOdata()).subscribe({
				next: (newChat: any) => {
					this.commonService
						.put(`Customers(${this.selectedCustomer?.id})`, { chat_id: newChat.id })
						.subscribe({
							next: (updatedCustomers: any) => {
								this.selectedCustomer = new Customer().deserialize(
									updatedCustomers
								);
								this.addActionLogMessage(messageContent);
							},
							error: error => {},
						});
				},
				error: (error: Error) => {
					console.error(error);
				},
			});
		} else {
			this.addActionLogMessage(messageContent);
		}
	}

	addActionLogMessage(content: string) {
		if (content) {
			const message = new Message().deserialize({
				sender: this.authService.loggedInUser || {},
				content: content,
				chat: this.selectedCustomer.chat,
			});
			this.notes.push(message);
			this.groupNotesByDate(); // Group notes by date after adding a new note
			if (message.chat?.id) {
				this.commonService.post("Messages", message.toOdata()).subscribe({
					next: (res: any) => {
						message.id = res.id;
						message.sender = this.authService.loggedInUser;
						this.refreshGridTable.emit(message);

						if (!this.selectedCustomer.chat?.messages?.length) {
							this.selectedCustomer.chat?.messages.push(message);
						}
					},
					error: (error: Error) => {
						console.error(error);
					},
				});
			} else this.refreshGridTable.emit(message);
		}
	}

	openInNewTab(url: string | undefined): void {
		if (url) {
			const windowFeatures = 'width=800,height=600,top=100,left=100,resizable,scrollbars';
		  	window.open(url, '_blank', windowFeatures);
		}
	}

	formattedNote(text: string | undefined): string {
		// Replace new line characters (\n) with <br> for display in HTML
		return text ? text.replace(/\n/g, '<br>') : '';
	}

	refreshActonLogs() {
		this.crmActionLogsComponent?.childComponent?.onFilterAndSorting();
	}
}