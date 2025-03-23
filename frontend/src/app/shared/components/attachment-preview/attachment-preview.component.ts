import { Component, Input } from "@angular/core";
import Attachment from "@app/shared/models/Attachment";
import {HttpClient} from "@angular/common/http";

@Component({
	selector: "app-attachment-preview",
	templateUrl: "./attachment-preview.component.html",
	styleUrls: ["./attachment-preview.component.scss"],
})
export class AttachmentPreviewComponent {
	selectedFile: any = undefined;
	public files: any = [];

	@Input() set attachmentFiles(dataItem: any) {
		this.files = dataItem;
		if (dataItem.length) {
			this.filesCount = this.files.length;
			this.selectedFile = this.files[0];
		}
	}

	@Input() isLoading: boolean = false
	fileSize = $localize`File Size`;
	documentTitle = $localize`Documents `;
	@Input() public filesCount: number = 0;

	@Input() public filePreviewHeight = '700'; // TODO: for testing purposes

	selectFile(item: any) {
		this.selectedFile = item;
	}

	constructor(protected http: HttpClient) {
	}

	downloadTextFile() {
		this.http.get(this.selectedFile?.original_url, { responseType: 'blob' }).subscribe((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = this.selectedFile?.name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		});

	}
}