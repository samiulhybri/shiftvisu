import { ChangeDetectorRef, Component, Input, OnInit, Output } from "@angular/core";

import { Subject } from "rxjs";
import { debounceTime, throttleTime } from "rxjs/operators";

import { IDirectory, IFile, ILinking, IMedia } from "@app/shared/interfaces/directory.interface.";

@Component({
	selector: "app-doc-visu-directory-view",
	templateUrl: "./doc-visu-directory-view.component.html",
	styleUrls: ["./doc-visu-directory-view.component.css"],
})
export class DocVisuDirectoryViewComponent implements OnInit {
	@Input() structure?: IDirectory;
	@Input() title?: string;
	@Input() fileClick: any;
	@Input() folderClick: any;
	@Input() processClick: any;
	@Input() showExpandButton: boolean = false;
	@Input() processActionButtons: any[] = [];
	@Input() folderActionButtons: any[] = [];
	@Input() fileActionButtons: any[] = [];
	@Input() rowClickEvent: any;
	@Input() showLinks: boolean = false;
	@Input() onBackButton?: any = null;
	@Input() public selectedTreeIndex: string = "0";
	@Input() needToShowActionButton: boolean = true;

	menuIsOpen: number | null = null;
	public tree?: IDirectory;
	public searchMenuOpened: boolean = false;
	public searchKeyword: string = "";
	public graph?: IDirectory;

	private folderSelectSubject = new Subject<any>();
	private processSelectSubject = new Subject<any>();
	private fileSelectSubject = new Subject<any>();
	private treeCustomButtonClickSubject = new Subject<any>();
	private onClickTreeItemSubject = new Subject<any>();
	private onTypingSearchSubject = new Subject<string>();

	isExpanded: boolean = true;

	onCustomButtonClick(event: any) {
		this.treeCustomButtonClickSubject.next(event);
		event();
	}

	onRowClick(node: any) {
		this.rowClickEvent(node);
	}

	setMenuIsOpen(treeIndex: number | null): void {
		this.onClickTreeItemSubject.next({ isMenuButton: true, treeIndex: treeIndex });
	}

	constructor(private cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.folderSelectSubject.pipe(throttleTime(100)).subscribe(folder => {
			if (this.folderClick) {
				this.folderClick(folder);
			}
		});

		this.fileSelectSubject.pipe(throttleTime(100)).subscribe(file => {
			if (this.fileClick) {
				this.fileClick(file);
			}
		});

		this.processSelectSubject.pipe(throttleTime(100)).subscribe(process => {
			if (this.processClick) {
				this.processClick(process);
			}
		});

		this.treeCustomButtonClickSubject.pipe(debounceTime(100)).subscribe(event => {});

		this.onClickTreeItemSubject.pipe(throttleTime(100)).subscribe(value => {
			if (value.isMenuButton) {
				this.menuIsOpen = this.menuIsOpen === value.treeIndex ? null : value.treeIndex;
				return;
			}
			this.selectedTreeIndex = value.treeIndex;
			if (value.isCustomButton) {
				value.customButtonClick(value.item);
				return;
			}
			if (
				value.item.type === "DocVisuDirectory" ||
				value.item.type === "LinkedDocVisuDirectory"
			) {
				this.onFolderSelect(value.item);
			} else if (
				value.item.type === "DocVisuFile" ||
				value.item.type === "LinkedDocVisuFile"
			) {
				this.onFileSelect(value.item);
			} else if (value.item.type === "DirectoryStructure") {
				this.onProcessSelect(value.item);
			}
		});

		this.onTypingSearchSubject.pipe(debounceTime(300)).subscribe(value => {
			this.onSearchItems(value);
		});

		if (this.structure) {
			this.buildTree();
		}
	}

	public async buildTree(structure?: IDirectory) {
		if (structure) {
			this.structure = structuredClone(structure);
		}

		const directories = await this.populateDirectory(
			structuredClone(this.structure!.directories),
			true
		);
		const links = await this.populateLinks(structuredClone(this.structure!.links), true);
		this.graph = {
			...structuredClone(this.structure),
			icon: "factory",
			status: "Positive",
			type: "DirectoryStructure",
			expanded: true, // Expand root directory
			directories: directories,
			linked: links,
		} as any;
		setTimeout(() => {
			this.tree = structuredClone(this.graph);
		}, 0);
		if (this.selectedTreeIndex === "0") {
			this.processClick(this.graph);
		}
		this.cdr.detectChanges();
	}

	onClickTreeItem(
		treeIndex: string,
		item: any,
		customButtonClick?: any,
		isCustomButton: boolean = false
	): void {
		this.onClickTreeItemSubject.next({ treeIndex, item, customButtonClick, isCustomButton });
	}

	onFileSelect(file: any): void {
		this.fileSelectSubject.next(file);
	}

	onFolderSelect(folder: any): void {
		this.folderSelectSubject.next(folder);
	}

	onProcessSelect(process: any): void {
		this.processSelectSubject.next(process);
	}

	toggleSearch() {
		this.searchMenuOpened = !this.searchMenuOpened;
		this.searchKeyword = "";
		this.graph = structuredClone(this.tree);
		this.cdr.detectChanges();
	}

	onTypeSearch() {
		this.onTypingSearchSubject.next(this.searchKeyword);
	}

	searchTree(node: any, keyword: string) {
		if (node.name && node.name?.toLowerCase().includes(keyword)) {
			return node;
		}

		const directories: any[] = [];
		const files: any[] = [];
		const linked: any = {
			files: [],
			directories: [],
		};

		if (node.directories) {
			node.directories.forEach((dir: IDirectory) => {
				const result = this.searchTree(dir, keyword);
				if (result) {
					directories.push(result);
				}
			});
		}

		if (node.files) {
			node.files.forEach((file: IFile) => {
				const latestMedia = file.media[file.media?.length - 1];
				if (latestMedia.name?.toLowerCase().includes(keyword)) {
					files.push(file);
				}
			});
		}

		if (node.linked) {
			const linkedFiles: IFile[] = [];
			const linkedDirectories: IDirectory[] = [];
			if (linkedFiles) {
				node.linked?.files.forEach((file: IFile) => {
					const latestMedia = file.media[file.media?.length - 1];
					if (latestMedia.name?.toLowerCase().includes(keyword)) {
						linkedFiles.push(file);
					}
				});
			}
			if (linkedDirectories) {
				node.linked?.directories.forEach((dir: IDirectory) => {
					const result = this.searchTree(dir, keyword);
					if (result) {
						linkedDirectories.push(result);
					}
				});
			}
			linked["files"] = [...linkedFiles];
			linked["directories"] = [...linkedDirectories];
		}

		if (
			directories.length > 0 ||
			files.length > 0 ||
			linked.files.length > 0 ||
			linked.directories.length > 0
		) {
			return {
				...node,
				directories,
				files,
				linked,
			};
		}

		return null;
	}

	onSearchItems(keyword: string) {
		if (keyword.trim().length > 0) {
			this.graph = this.searchTree(structuredClone(this.tree), keyword.toLowerCase().trim());
			if (!this.graph) {
				this.graph = structuredClone({
					...this.tree,
					directories: [],
					files: [],
					links: [],
				}) as any;
			}
		} else {
			this.graph = structuredClone(this.tree);
		}
		this.menuIsOpen = 0;
		this.cdr.detectChanges();
	}

	toggleExpandCollapse(): void {
		this.isExpanded = !this.isExpanded;
		if (this.graph) {
			this.toggleExpandCollapseTree(this.graph, this.isExpanded);
		}
	}

	private toggleExpandCollapseTree(node: IDirectory, expand: boolean): void {
		node.expanded = expand;
		if (node.directories) {
			node.directories.forEach((dir: IDirectory) =>
				this.toggleExpandCollapseTree(dir, expand)
			);
		}
	}

	async populateDirectory(
		directories: IDirectory[],
		expand: boolean = true,
		type: string = "DocVisuDirectory"
	): Promise<IDirectory[]> {
		if (!directories || directories.length === 0) {
			return [];
		}

		return Promise.all(
			directories.map(async (directory: IDirectory) => ({
				...directory,
				status: "Positive",
				type: type,
				expanded: expand, // Expand all directories
				files: await this.populateFiles(
					directory.files,
					expand,
					type === "LinkedDocVisuDirectory" ? "LinkedDocVisuFile" : "DocVisuFile"
				),
				directories: await this.populateDirectory(directory.directories, expand, type),
				linked: await this.populateLinks(this.showLinks ? directory.links : []),
			}))
		);
	}

	async populateLinks(links?: ILinking[], expand: boolean = true) {
		const linked: any[] = [];
		if (links && links.length) {
			const files: any[] = [];
			const directories: any[] = [];
			links.map(async (link: ILinking) => {
				if (link.file) {
					files.push(
						...(await this.populateFiles([link.file], true, "LinkedDocVisuFile"))
					);
				} else if (link.directories && link.directories.length) {
					directories.push(
						...(await this.populateDirectory(
							link.directories,
							expand,
							"LinkedDocVisuDirectory"
						))
					);
				} else if (link.files && link.files.length) {
					files.push(
						...(await this.populateFiles(link.files, expand, "LinkedDocVisuFile"))
					);
				}
			});

			return {
				directories: directories,
				files: files,
			};
		}
		return null;
	}

	async populateFiles(
		files: IFile[],
		expand: boolean = true,
		type: string = "DocVisuFile"
	): Promise<IFile[]> {
		if (!files || files.length === 0) {
			return [];
		}

		const processedFiles = await Promise.all(
			files.map(async (file: IFile) => {
				if (!file.media || file.media.length === 0) {
					return null;
				}

				const sortedMedia = [...file.media].sort(
					(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);

				const latestMedia = sortedMedia[0];
				const mimeType = latestMedia.mime_type?.toLowerCase() || "";

				let icon = "document";
				if (mimeType.includes("image")) icon = "attachment-photo";
				else if (mimeType.includes("pdf")) icon = "pdf-attachment";
				else if (mimeType.includes("word")) icon = "doc-attachment";
				else if (mimeType.includes("excel")) icon = "excel-attachment";
				else if (mimeType.includes("powerpoint")) icon = "ppt-attachment";
				else if (mimeType.includes("audio")) icon = "attachment-audio";
				else if (mimeType.includes("video")) icon = "attachment-video";
				else if (mimeType.includes("zip")) icon = "attachment-zip-file";
				else if (mimeType.includes("text")) icon = "attachment-text-file";

				return {
					...file,
					type: type,
					name: latestMedia.name,
					icon: icon,
					mimeType: mimeType,
					expanded: expand,
					media: [latestMedia],
					allMedia: sortedMedia,
				};
			})
		);

		return processedFiles.filter(file => file !== null) as IFile[];
	}
}
