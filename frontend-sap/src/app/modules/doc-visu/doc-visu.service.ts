import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { CommonService } from "@app/shared/services/common.service";

@Injectable({
	providedIn: "root",
})
export class DocVisuService extends CommonService {
	private readonly directoryStructureModel: string = "App\\Models\\DocVisu\\DirectoryStructure";
	private readonly directoryModel: string = "App\\Models\\DocVisu\\DocVisuDirectory";
	private readonly documentSectionModel: string = "App\\Models\\DocVisu\\DocumentSection";
	private readonly documentProcessItemModel: string = "App\\Models\\DocVisu\\DocumentProcessItem";
	private readonly fileModel: string = "App\\Models\\DocVisu\\DocVisuFile";
	private readonly fileVersionModel: string = "App\\Models\\DocVisu\\FileVersion";
	private readonly fileNoteModel: string = "App\\Models\\DocVisu\\FileNote";

	public selectedStructureId: BehaviorSubject<number> = new BehaviorSubject<number>(0);
	public selectedNavDocSection: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	public docSectionChanged: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	public selectedMedia: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	public selectedFile: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public getDocumentSectionNavItems() {
		return this.get("doc-visu/document-sections", false);
	}

	public getDirectoryStructures() {
		return this.get("doc-visu/directory-structures", false);
	}

	public getStructureByFilter(filter: string) {
		return this.get(`doc-visu/directory-structures?${filter}`, false);
	}

	public getDocVisuMedia(model: string, modelId: number) {
		return this.get(`media/${model}/` + modelId, false);
	}

	public updateProcess(itemName: string, id: number, isActive: boolean) {
		return this.patch(`DirectoryStructures/${id}`, {
			name: itemName,
			is_active: isActive,
		});
	}

	public deleteProcess(id: number) {
		return this.delete(`DirectoryStructures/${id}`);
	}

	public createRootFolder(name: string, id: number) {
		return this.createFolder(name, this.directoryStructureModel, id);
	}

	public createSubFolder(name: string, id: number, isUpdate: boolean = false) {
		if (isUpdate) {
			return this.updateFolder(id, { name });
		}
		return this.createFolder(name, this.directoryModel, id);
	}

	public createFolder(name: string, type: string, id: number) {
		return this.post(`DocVisuDirectories`, {
			name,
			parent_type: type,
			parent_id: id,
		});
	}

	public updateFolder(id: number, payload: any) {
		return this.patch(`DocVisuDirectories/${id}`, { ...payload });
	}

	public linksDirectories(payload: any) {
		return this.post(`doc-visu/linking`, { ...payload }, false);
	}

	public getStructureWithDirectories(id: number) {
		return this.get(`doc-visu/directory-structures/${id}`, false);
	}

	public deleteFolder(id: number) {
		return this.delete(`DocVisuDirectories/${id}`);
	}

	public deleteFile(id: number) {
		return this.delete(`DocVisuFiles/${id}`);
	}

	public updateFile(id: number, payload: any) {
		return this.post(`doc-visu/files/${id}/media`, payload , false);
	}

	public createDirectoryStructure(name: string, id: number, isActive: boolean, directory: any) {
		return this.post(
			"doc-visu/directory-structures",
			{
				name,
				sectionable_type: this.documentSectionModel,
				sectionable_id: id,
				is_active: isActive,
				custom_id: `${id}-${name}`,
				directories: directory?.directories,
			},
			false
		);
	}

	public assignDirectoryStructure(name: string, model: string, id: number, directory: any) {
		return this.post(
			"doc-visu/directory-structures",
			{
				name,
				sectionable_type: model,
				sectionable_id: id,
				is_active: true,
				custom_id: `${id}-${name}`,
				directories: directory?.directories,
			},
			false
		);
	}

	async getDirectoryStructureCustomId() {
		const customId = await this.getEntity("DocVisuDirectoryStructure").catch(() => false);

		if (typeof customId === "boolean") return "";

		return customId;
	}
}
