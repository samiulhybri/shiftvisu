import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
} from "@angular/core";
import { debounceTime, distinctUntilChanged, Observable, tap } from "rxjs";
import { CommonService } from "@app/shared/services/common.service";
import Popover from "@ui5/webcomponents/dist/Popover";
import { ProdOrderPosOperationHandlingUnit } from "@app/shared/models/prod-order-pos-operation-handling-unit.model";

@Component({
	selector: "app-entity-selection-dialog",
	templateUrl: "./entity-selection-dialog.component.html",
	styleUrl: "./entity-selection-dialog.component.css",
})
export class EntitySelectionDialogComponent implements OnChanges, OnInit {
	@Input() entity: string | null = null;
	@Input() handlingUnit?: ProdOrderPosOperationHandlingUnit[] = [];
	@Input() title: string | undefined = undefined;
	@Input() searchKey: string | null = null;
	@Input() searchQuery: string | null = "";
	@Input() inputReference?: any;
	@Input() toggleAction?: boolean;
	@Input() staticData?: any[];

	@ViewChild("dynamicPopover") dynamicPopover!: Popover;

	@Output() entitySelected = new EventEmitter();

	data: any[] = [];
	loading: boolean = false;
	canLoadMore: boolean = true;
	skip: number = 0;
	top: number = 50;
	isDataAvailableFromKeyPress: boolean = false;

	constructor(private commonService: CommonService) {}

	ngOnInit() {
		this.fetch().subscribe();
	}

	openPopover() {
		this.dynamicPopover.opener = this.inputReference;
		this.dynamicPopover.open = true;
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.loading = false;
		this.canLoadMore = true;
		this.skip = 0;
		// If `searchQuery` is present in changes and has changed
		if (
			changes["searchQuery"] &&
			changes["searchQuery"].currentValue !== changes["searchQuery"].previousValue
		) {
			// If the searchQuery has a value (non-empty) or is an empty string
			if (this.searchQuery !== null) {
				this.onSearchItemData(); // Call search function only if searchQuery has changed
			}
		}
		if (this.inputReference && !this.dynamicPopover.open) {
			this.data = [];
			this.openPopover();
			this.fetch().subscribe();
		}
	}

	onSearchItemData() {
		this.isDataAvailableFromKeyPress = true;
		this.canLoadMore = true;
		this.fetch()
			.pipe(debounceTime(300), distinctUntilChanged())
			.subscribe({
				next: () => {},
				error: () => {},
				complete: () => {
					this.skip = 0;
				},
			});
	}

	onLoadMoreItems() {
		if (this.isDataAvailableFromKeyPress) {
			this.skip += this.top;
		}
		this.fetch().subscribe();
	}

	onItemSelect(event: any) {
		const id = event.item.id;

		const item = this.data.find(item => item.id == id);

		this.entitySelected?.emit(item);
		this.closePopover();
	}

	closePopover() {
		this.entitySelected?.emit(null);
		this.searchQuery = "";
		this.dynamicPopover.open = false;
	}

	isListItemDuplicate(singleDataCustomId: any): boolean {
		if (!singleDataCustomId) {
			return false;
		}
		return this.handlingUnit?.some(hu => hu.handlingUnit?.custom_id == singleDataCustomId)
			? true
			: false;
	}

	fetch(): Observable<any> {
		if (this.staticData) {
			this.data = this.staticData.filter(
				(item: any) =>
					!this.searchQuery ||
					item[this.searchKey as string]
						.toLowerCase()
						.includes(this.searchQuery?.toLowerCase())
			);
			this.loading = false;
			this.canLoadMore = false;
			return new Observable();
		}

		if (!this.canLoadMore || !this.entity) {
			return new Observable();
		}

		this.canLoadMore = false;

		this.loading = true;
		const filterQuery = this.searchQuery
			? `$filter=contains(${this.searchKey}, '${this.searchQuery}')&`
			: "";
		const url = `${this.entity}?${filterQuery}$skip=${this.skip}&$top=${this.top}`;

		return this.commonService.get(url).pipe(
			tap((res: any) => {
				if (this.skip === 0) {
					this.data = res.value;
				} else {
					this.data = [...this.data, ...res.value];
				}
				this.skip += this.top;
				this.loading = false;

				this.canLoadMore = res.value.length != 0;
			})
		);
	}
}
