import { Deserializable } from "@app/shared/interfaces/deserializable";
import { readEml } from 'eml-parse-js';
import MsgReader from '@kenjiuno/msgreader';

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
	html_content?: string;


	deserialize(input: any): this {
		Object.assign(this, input);
    if(input.path) {
      this.original_url = input.path;
    }

		return this;
	}

	private readonly fileTypes = new Map<string, string[]>([
		["image", ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp", 'image/svg+xml']],
		[
			"document",
			[
				"application\/msword", // .doc
				"application\/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
			],
		],
		["pdf", ["application/pdf"]],
		[
			"excel",
			[
				"application/vnd.ms-excel", // .xls
				"application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
			],
		],
		[
			"powerpoint",
			[
				"application/vnd.ms-powerpoint", // .ppt
				"application\/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
			],
		],
		["text", ["text/plain"]],
		["message", ["message/rfc822","application/vnd.ms-outlook"]]
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

	getDocumentUrl(): string | undefined {
		return this.html_content;
	}

	// Its better for parse from backend server
	async parseFileFromUrl() {
		const url = this.original_url;
		if (!url) {
			return null;
		}
		try {
			// Fetch the .eml file as plain text
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch the .eml file: ${response.statusText}`);
			}
			let parsedData: any;
			if (this.mime_type === "application/vnd.ms-outlook") {
				parsedData = this.parseMsgContent(response);
			}
			else if (this.mime_type === "message/rfc822") {
				const parsedEmlData = await this.parseEmlContent(response);
				parsedData = this.processParsedData(parsedEmlData)
			}
			return this.processBoldTags(parsedData);
		} catch (error) {
			return {html: '<html><body> <p> No preview available </p> </body> </html>'};
		}
	}

	// Function to parse the .eml content using eml-format
	async parseEmlContent(response: Response): Promise<any> {
		const emlContent = await response.text();
		return new Promise((resolve, reject) => {
			readEml(emlContent, (error, data) => {
			if (error) reject(error);
			else resolve(data);
		  });
		});
	}
	
	// Function to parse the .msg content using msg-reader
	async parseMsgContent(response: Response) {
		const arrayBufferContent = await response.arrayBuffer();
		const msgReader = new MsgReader(arrayBufferContent);
		const parsedData = msgReader.getFileData();
		let parsedHtml = this.arrayBufferToHtml(parsedData.html);
		if (parsedData.attachments && parsedData.attachments.length) {
			parsedData.attachments.forEach((attachment: any) => {
				attachment.data = msgReader.getAttachment(attachment).content;
				const base64Url = this.convertToBase64(attachment);
				if (attachment.pidContentId) {
					parsedHtml = parsedHtml.replace(
						`cid:${attachment.pidContentId}`,
						base64Url
					);
				}
			});
		}
		return {
		  subject: parsedData.subject,
		  senderEmail: parsedData.senderEmail,
		  recipients: parsedData.recipients ? parsedData.recipients.map((r: any) => r.email).join(', ') : '',
		  body: parsedData.body,
		  attachments: parsedData.attachments,
		  html: parsedHtml
		};
	}

	convertToBase64(attachment: any): string {
		const binary = Array.from(new Uint8Array(attachment.data), (byte) => String.fromCharCode(byte)).join('');
		const base64String = btoa(binary);
		return `data:${attachment.attachMimeTag};base64,${base64String}`;
	}
	
	arrayBufferToHtml(arrayBuffer: ArrayBuffer| Uint8Array | undefined): string {
		const decoder = new TextDecoder('utf-8');
		return decoder.decode(arrayBuffer);
	}

	// Modify image URLs to inline them as base64 or adjust src
	private processParsedData(parsedData: any): any {
		if (parsedData.html && parsedData.attachments) {
		  parsedData.html = parsedData.html.replace(
			/src="cid:([^"]+)"/g,
			(_:any, cid:any) => {
			  // Find the attachment that matches the `cid`
			  const attachment = parsedData.attachments.find(
				(att: any) =>
				  att.id === `<${cid}>` || // Match the format in your cid attribute
				  att.contentId === cid ||
				  att.generatedFileName === cid
			  );
	  
			  if (attachment) {
				// Use data64 if it's available; otherwise, encode `data` manually
				// Prepare the base64 data, escaping any double quotes if necessary
				const base64String = attachment.data64
				? `data:${attachment.contentType.replace(/"/g, '')};base64,${attachment.data64}`
				: `data:${attachment.contentType.replace(/"/g, '')};base64,${Buffer.from(
					attachment.data
				  ).toString('base64')}`;
	
			  	// Return the src with single quotes to avoid double-quote conflicts
			  	return `src='${base64String}'`;
			  }
			  // Return an empty src if the image cannot be found
			  return `src=""`;
			}
		  );
		}
		return parsedData;
	}

	private processBoldTags(parsedData: any): any {
		if (parsedData.html) {
			parsedData.html = parsedData.html.replace(/(<\/?b>)/g, '&nbsp;$1&nbsp;');
		}
		return parsedData;
	}
	

	toOdata(): Object {
		return {
			...this,
      path:undefined,
	  html_content: undefined,
		};
	}
}
