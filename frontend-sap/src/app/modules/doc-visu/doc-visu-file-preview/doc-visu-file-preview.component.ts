import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { BehaviorSubject, Subject, takeUntil } from "rxjs";

import Attachment from "@app/shared/models/attachment.model";
import { CommonService } from "@app/shared/services/common.service";

import { DocVisuService } from "@doc-visu/doc-visu.service";

@Component({
	selector: "app-doc-visu-file-preview",
	templateUrl: "./doc-visu-file-preview.component.html",
	styleUrl: "./doc-visu-file-preview.component.css",
})
export class DocVisuFilePreviewComponent implements OnInit, OnDestroy {
	isLoading: any = false;
	uploadedBy = $localize`Uploaded By:`;
	uploadedOn = $localize`Uploaded On:`;
	fileSize = $localize`File Size`;
	documentTitle = $localize`Documents `;
	public filename: string = "";

	@Input() public filesCount: number = 0;
	@Input() public model = "";
	@Input() public modelId!: any;
	@Input() public filePreviewHeight = 850;
	@Input() public selectedFile: any;
	public file?: any;

	private mediaId: number = 0 ;

	@Input() public media?: BehaviorSubject<Attachment>;
	private destroy$ = new Subject<void>();

	constructor(
		protected _commonSrv: CommonService,
		private sanitizer: DomSanitizer,
		private cdr: ChangeDetectorRef,
		private docVisuService: DocVisuService
	) {}

	ngOnInit(): void {
		if (this.selectedFile) {
			this.filename = this.selectedFile?.name;
			const medias = this.selectedFile.media;
			const media = medias[medias.length - 1];
			this.mediaId = media.id;
			if (media) {
				this.file = new Attachment().deserialize(media);
				this.loadFiles(this.selectedFile.id, media.id);
			}
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	public loadFiles(modelId: number, mediaId: number) {
		if (modelId) {
			this.isLoading = true;
			this._commonSrv
				.get(`media/DocVisuFile/` + modelId, false)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: async (response: any) => {
						const media = response.media;
						const index = media.findIndex((m: any) => m.id === mediaId);

						if (index > -1) {
							const attachment = new Attachment().deserialize({...media[index]});

							if (attachment.checkFileType() === "message") {
								const parsed_eml = await attachment.parseFileFromUrl();
								attachment.html_content = this.sanitizer.bypassSecurityTrustHtml(parsed_eml.html) as any;
							}
							this.file = attachment;
						}
						this.isLoading = false;
						this.cdr.detectChanges();
					},
					error: e => {
						this.isLoading = true;
						this.cdr.detectChanges();
					},
				});
		}
	}
}
