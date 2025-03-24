import { Component, ComponentRef, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { OfferPos } from "@app/models/offer-pos";
import { GridColumn } from "@app/shared/models/grid-column.model";
import { CommonService } from "@app/shared/services/common.service";
import { HweKalkService } from "../hwe-kalk.service";
import { CalculationDetailsComponent } from "../offers/calculation-details/calculation-details.component";
import { GridProperty } from "@app/shared/classes/grid-property";

@Component({
	selector: "app-evaluations",
	templateUrl: "./evaluations.component.html",
	styleUrls: ["./evaluations.component.scss"],
})
export class EvaluationsComponent extends GridProperty {
	public isWindowLoaderEnabled: boolean = false;
	public formData: any;
	public cmpRef!: ComponentRef<any>;
	public columns: GridColumn[] = [];
	public addWindowEvent!: Event;
	public editView = {
		actionButton: "edit",
		modalTemplate: CalculationDetailsComponent,
		modalWidth: "95vw",
		isCustomizedHandler: true,
		hasRemoveCommand: false,
		isOnPageFilter: true,
		isHiddenActionColumn: true,
	};

	public toolbarConfig = {
		title: $localize`Evaluations`,
		hasAddCommand: false,
		hasSearch: true,
	};

	protected isArchived: boolean = true;

	@ViewChild("modalBody", { read: ViewContainerRef }) modalBody!: ViewContainerRef;

	constructor(
		_commonService: CommonService,
		protected hweKalkService: HweKalkService,
		protected route: ActivatedRoute
	) {
		super(_commonService);
	}

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.columns = this.getColumns();
			this.setRequest();
		});
	}

	setRequest() {
		this.state.take = 50;
		this.url = `evaluation?is_archived=${!this.isArchived}`;
		this.sendRequest();
	}

	public override sendRequest(): void {
		this.isLoadedEnabled = true;
		this._commonService.get(this.url, false).subscribe({
			next: (response: any) => {
				this.gridItems = response;
				this.isLoadedEnabled = false;
			},
			error: e => (this.isLoadedEnabled = false),
		});
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "offer_pos.offer.customer.name",
				title: $localize`Customer Name`,
				filterable: true,
				width: "200px",
			},
			{
				name: "offer_pos.offer.sales_area.name",
				title: $localize`Sales Area`,
				filterable: true,
				width: "200px",
			},
			{
				name: "offer_pos.offer.request_date",
				title: $localize`Requested Date`,
				filterable: true,
				width: "200px",
			},
			{
				name: "offer_pos.offer.custom_id",
				title: $localize`Offer Id`,
				filterable: true,
				width: "100px",
			},
			{
				name: "offer_pos.pos",
				title: $localize`Position`,
				filterable: true,
				width: "100px",
			},
			{
				name: "offer_pos.item_name",
				title: $localize`Name`,
				filterable: true,
				width: "150px",
			},
			{
				name: "offer_pos.quantity",
				title: $localize`Quantity`,
				filterable: true,
				width: "100px",
			},
			{
				name: "offer_pos.material.name",
				title: $localize`Material`,
				filterable: true,
				width: "200px",
			},
			{
				name: "offer_pos.product_type",
				title: $localize`Product Type`,
				filterable: true,
				width: "200px",
			},
			{
				name: "offer_pos.delivery_state",
				title: $localize`Delivery State`,
				filterable: true,
				width: "150px",
			},
			{
				name: "offer_pos.customer_material_number",
				title: $localize`Customer Material Number`,
				filterable: true,
				width: "200px",
			},
			{
				name: "offer_pos.drawing_id",
				title: $localize`Drawing Id`,
				filterable: true,
				width: "150px",
			},
			{
				name: "offer_pos.outer_diameter_final",
				title: $localize`Outer Diameter Final`,
				filterable: true,
				width: "150px",
			},
			{
				name: "offer_pos.inner_diameter_final",
				title: $localize`Inner Diameter Final`,
				filterable: true,
				width: "150px",
			},
			{
				name: "offer_pos.max_outer_diameter",
				title: $localize`Max outer diameter`,
				filterable: true,
				width: "150px",
			},
			{
				name: "offer_pos.total_length",
				title: $localize`Total length`,
				filterable: true,
				width: "150px",
			},
			{
				name: "offer_pos.side_a_final",
				title: $localize`Side A Final`,
				filterable: true,
				width: "150px",
			},
			{
				name: "offer_pos.side_b_final",
				title: $localize`Side B Final`,
				filterable: true,
				width: "150px",
			},
			{
				name: "offer_pos.height_final",
				title: $localize`Height Final`,
				filterable: true,
				width: "150px",
			},
			{
				name: "delivery",
				title: $localize`Delivery`,
				filterable: true,
				width: "150px",
			},
			{
				name: "sales_order",
				title: $localize`Sales Order`,
				filterable: true,
				width: "150px",
			},
			{
				name: "sales_order_pos",
				title: $localize`Sales Order Position`,
				filterable: true,
				width: "150px",
			},
		];
	}

	downloadExcel() {
		window.open(`/api/evaluation-excel?is_archived=${!this.isArchived}`);
	}

	onArchivedButtonClicked() {
		this.isArchived =! this.isArchived;
		this.setRequest();
	}
}
