import { Component, Input } from "@angular/core";
import Attachment from "@app/shared/models/attachment.model";
import { CommonService } from "@app/shared/services/common.service";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: "app-file-preview",
	templateUrl: "./file-preview.component.html",
	styleUrl: "./file-preview.component.css",
})
export class FilePreviewComponent {
	selectedFile: any = undefined;
	isLoading: any = false;
	files: any = [];
	uploadedBy = $localize`Uploaded By:`;
	uploadedOn = $localize`Uploaded On:`;
	fileSize = $localize`File Size`;
	documentTitle = $localize`Documents `;
	@Input() public filesCount: number = 0;
	@Input() public model = "";
	@Input() public modelId!: any;
	@Input() isOpenFromUploader: boolean = false;
	@Input() selectedFileId!: number;

	// @Input() public set modelId(data: any) {
	// 	if (data) {
	// 		this.files = [];
	// 		this.selectedFile = undefined;
	// 		this.loadFiles(data);
	// 	}
	// }
	@Input() public filePreviewHeight = 700; // TODO: for testing purposes

	constructor(protected _commonSrv: CommonService,private sanitizer: DomSanitizer) {}

	ngOnChanges(change: any) {
		this.filesCount = change.filesCount ? change.filesCount.currentValue : this.filesCount;
		this.modelId = change.modelId ? change.modelId.currentValue : this.modelId;
		this.files = [];
		this.selectedFile = undefined;
		this.loadFiles(this.modelId);
	}

	selectFile(event: any) {
		const url = event.detail.item.id;
		this.selectedFile = this.files.find((file: any) => file.path === url);
	}

	private loadFiles(modelId?: any) {
		if (modelId) {
			this.isLoading = true;
			this._commonSrv.get(`media/${this.model}/` + modelId, false).subscribe({
				next: async (response: any) => {
					for (const i in response.media) {
						this.files.push(new Attachment().deserialize(response.media[i]));
						if(!this.isOpenFromUploader && Number(i) == 0) this.selectedFile = this.files[i];
						else if(this.isOpenFromUploader && this.selectedFileId) 
							this.selectedFile = this.files.find((file: any) => file.id === this.selectedFileId);
						
						if (this.files[i].checkFileType() === "message") {
							const parsed_eml = await this.files[i].parseFileFromUrl();
							this.files[i].html_content = this.sanitizer.bypassSecurityTrustHtml(parsed_eml.html);
						}
					}

					this.filesCount = this.files.length;
					this.isLoading = false;
				},
				error: e => {
					this.isLoading = false;
				},
			});
		}
	}
}
