import {
	ChangeDetectorRef,
	Component,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges,
} from "@angular/core";

import { EightDReport } from "@app/shared/models/eight-d-report.model";
import { AuthService } from "@app/shared/services/auth.service";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";

@Component({
	selector: "app-congratulation",
	templateUrl: "./congratulation.component.html",
	styleUrl: "./congratulation.component.css",
})
export class CongratulationComponent {
	@Input() eightDReport: EightDReport = {
		title: "",
		author_accepted: false,
		author_closing_date: "",
		client_accepted: false,
		client_name: "",
		client_closing_date: "",
	};

	eightDReportId: number = 0;

	@Input() saveMode: "post" | "patch" | null = null;

	@Input() set setEightDReportId(id: number) {
		if (id) {
			this.eightDReportId = id;
			this.isFetchingSignatures = true;
			this.uploadedFiles = [];
			this.qualiVisuService
				.get(`media/eightDReport/${this.eightDReportId}?collection=signature`, false)
				.subscribe((response: any) => {
					this.uploadedFiles = [...response.media];
					this.isFetchingSignatures = false;
				});
		}
	}

	fileSizeText = $localize`File Size`;

	private readonly fileTypes: { [key: string]: string[] } = {
		image: [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/bmp",
			"image/webp",
			"image/svg+xml",
		],
		document: [
			"application/msword", // .doc
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
		],
		pdf: ["application/pdf"],
		excel: [
			"application/vnd.ms-excel", // .xls
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
		],
		powerpoint: [
			"application/vnd.ms-powerpoint", // .ppt
			"application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
		],
		txt: ["text/plain"],
	};

	imageSource = "";
	fileArr: any[] = [];
	uploadedFiles: any[] = [];
	isFetchingSignatures: boolean = false;

	constructor(
		private auth: AuthService,
		private qualiVisuService: QualiVisuService,
		private cdr: ChangeDetectorRef
	) {}

	get user() {
		return this.auth.getUser();
	}

	checkFileType(fileType: string, type: string) {
		return this.fileTypes[type]?.includes(fileType) ?? false;
	}

	uploadNewFiles(files: any) {
		const validFiles: File[] = [];
		const invalidFiles: string[] = [];

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

		await this.uploadTempFile();
	}

	uploadTempFile() {
		this.uploadedFiles.map((file: any, index: number) => {
			if (!file?.id) {
				const formData = new FormData();
				formData.append("reportId", this.eightDReport.id + "");
				formData.append("media", file);

				this.qualiVisuService
					.post(`quali-visu/${this.eightDReport.id}/upload-signature`, formData, false)
					.subscribe({
						next: (res: any) => {
							this.uploadedFiles[index] = res;
						},
						error: err => {
							console.error("upload file error: ", err);
						},
					});
			}
		});
	}

	onFileChange(e: any) {
		e.preventDefault();
		const files = e.detail.files;
		this.uploadNewFiles(files);
	}

	deleteFile(data: any) {
		let file = this.uploadedFiles[data.item.id];
		this.uploadedFiles = this.uploadedFiles.filter((d, i) => i != Number(data.item.id));

		if (file.id) {
			this.qualiVisuService.delete(`media/${file.id}`, false).subscribe({
				next: () => {},
			});
		}
	}

	fileShow(file: any) {
		if (file.path) {
			var width = 800;
			var height = 600;
			var left = window.innerWidth / 2 - width / 2;
			var top = window.innerHeight / 2 - height / 2;
			
			window.open(
				file.path,
				"newWindow",
				`width=${width},height=${height},left=${left},top=${top}`
			);
		}
	}
}
