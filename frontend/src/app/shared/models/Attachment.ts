import { Deserializable } from "@app/interfaces/deserializable";

export default class Attachment implements Deserializable {
	id?: number;
	model_type?: string;
	model_id?: number;
	uuid?: string;
	collection_name?: string;
	name?: string;
	file_name?: string;
	mime_type?: string;
	disk?: string;
	conversions_disk?: string;
	size?: number;
	order_column?: number;
	created_at?: string;
	updated_at?: string;
	is_selected?: boolean;
	original_url?: string;
	preview_url?: string;

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.original_name) {
			this.name = input.original_name;
		}
		if (input.ext) {
			this.mime_type = input.ext.toLowerCase();
		}

		if (input.file_location) {
			this.original_url = `${window.location.origin}${input.file_location}`;
		}

		return this;
	}

	private readonly fileTypes = new Map<string, string[]>([
		[
			"image",
			[
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/gif",
				"image/bmp",
				"image/webp",
				"image/svg+xml",
				".jpg",
				".png",
				".gif",
			],
		],
		[
			"document",
			[
				"application/msword", // .doc
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
				".doc",
				".docx",
			],
		],
		["pdf", ["application/pdf"]],
		[
			"excel",
			[
				"application/vnd.ms-excel", // .xls
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx,
				".xls",
				".xlsx",
			],
		],
		[
			"powerpoint",
			[
				"application/vnd.ms-powerpoint", // .ppt
				"application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
				".ppt",
				".pptx",
			],
		],
		["text", ["text/plain", ".txt"]],
	]);

	checkFileType(): string | null {
		for (const [type, mimeTypes] of this.fileTypes.entries()) {
			if (mimeTypes.includes(this.mime_type || "")) {
				return type;
			}
		}
		return null;
	}

	getGoogleDocViewerUrl(): string {
		return `https://docs.google.com/gview?url=${encodeURIComponent(
			this.original_url || ""
		)}&embedded=true`;
	}

	getFormattedDate() {
		if (!this.created_at) return "";

		const date = new Date(this.created_at);
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
		const year = date.getFullYear();
		const formattedDate = `${day}/${month}/${year}`;
		return formattedDate;
	}

	getFileSizeInKB() {
		if (!this.size) return "";

		return `${parseFloat(`${this.size / 1024}`).toFixed()} KB`;
	}

	toOdata(): Object {
		return {
			...this,
		};
	}
}
