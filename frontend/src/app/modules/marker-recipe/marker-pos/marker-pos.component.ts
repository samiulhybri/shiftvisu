import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MarkerRecipePosTypeClass, MarkerRecipePosType } from '@app/enums/marker-recipe-pos-type';
import { MarkerRecipe } from '@app/models/marker-recipe';
import { MarkerRecipePos } from '@app/models/marker-recipe-pos';
import { User } from '@app/models/user';
import { AuthService } from '@app/services/auth.service';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { GridProperty } from '@app/shared/classes/grid-property';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { CommonService } from '@app/shared/services/common.service';
import { Notification } from '@app/shared/services/notification.service';
import { GridDataResult } from '@progress/kendo-angular-grid';

@Component({
	selector: 'app-marker-pos',
	templateUrl: './marker-pos.component.html',
	styleUrls: ['./marker-pos.component.scss']
})
export class MarkerPosComponent extends GridProperty {
	@Input() recipe!: MarkerRecipe;
	@Input() isNewBtnDisable!: boolean;
	@Input() isGridVisible!: boolean;
	@Input() isMachineMatched!: boolean;

	private allPosData: any = [];
	public isLoaderEnabled: boolean = false;
	public isOpenAddPosModal: boolean = false;
	public form!: FormGroup;
	public columns = this.getColumns();
	public posTypeList!: Array<{ value: string; text: string }>;
	public selectedRecipePos: any = {};
	public cmbFltr: any;
	public isNewPos: boolean = false;
	public modalTitle: string = '';
	public posData?: MarkerRecipePos;
	public isViewBlockGrid: boolean = false;
	public isNewBlockDisable: boolean = false;
	public isEditDisabled: boolean = false;
	public isDeleteDisabled: boolean = false;
	public rowSelected: number[] = [0];

	public editView = {
		actionButton: "Edit",
		actionColumnWidth: 173,
		custom: true,
		isSelection: true
	};

	private currentUser!: User;
	public hasUpdatePermission: boolean = false;
	
	constructor(_commonService: CommonService,
		protected formBuilder: FormBuilder,
		private notification: Notification,
		private authSrv: AuthService) {
		super(_commonService)
	}

	ngOnChanges(change: any) {
		this.recipe = change.recipe ? change.recipe.currentValue : this.recipe;
		this.isNewBtnDisable = change.isNewBtnDisable ? change.isNewBtnDisable.currentValue : this.isNewBtnDisable;
		this.isGridVisible = change.isGridVisible ? change.isGridVisible.currentValue : this.isGridVisible;
		this.isMachineMatched = change.isMachineMatched ? change.isMachineMatched.currentValue : this.isMachineMatched;
		this.isViewBlockGrid = false;
		this.isNewBlockDisable = true;
		this.ngOnInit();
	}

	ngOnInit() {
		this.currentUser = this.authSrv.user;
		this.hasUpdatePermission = this.currentUser && this.currentUser.permissions && 
			(this.currentUser.permissions.includes("CASTVISU_POWER") || 
			this.currentUser.permissions.includes("CASTVISU_ADMIN") || 
			this.currentUser.permissions.includes("CASTVISU_SUPER")) ? true : false;

		if(this.isMachineMatched) {
			this.isEditDisabled = false;
			this.isDeleteDisabled = false;
		} else {
			this.isEditDisabled = true;
			this.isDeleteDisabled = true;
		}

		this.isNewBtnDisable = true;
		this.posTypeList = new MarkerRecipePosTypeClass().getEnumArray();
		this.cmbFltr = new ComboFilter(this.posTypeList);
		this.state.take = 50;

		if (this.recipe && this.isGridVisible) {
			this.url = `MarkerRecipePos?$filter=marker_recipe_id eq '${this.recipe.id}'&expand=markerRecipe,markerRecipePosBlock&$orderby=pos`;
			this.sendRequest();
		}

		this.getFormStructure();
		if (this.form) this.form.enable();
	}

	override sendRequest(): void {
		this.isLoadedEnabled = true;
		this._commonService.getLodata(this.state, this.url).subscribe({
			next: (response: GridDataResult) => {
				this.gridItems = response;
				this.allPosData = response.data;
				this.getPosFirstItem();
				this.rowSelected = [0];
				this.isNewBtnDisable = false;
				this.isLoadedEnabled = false;
			},
			error: (e) => this.isLoadedEnabled = false
		});
	}

	getPosFirstItem() {
		if (this.allPosData && this.allPosData.length > 0) {
			this.onPosClicked(this.allPosData[0], '');
			this.isNewBlockDisable = false;
		} else {
			this.isNewBlockDisable = true;
			this.isViewBlockGrid = false;
		}
	}

	getFormStructure() {
		this.form = this.formBuilder.group({
			markerRecipe: this.recipe,
			pos: new FormControl(1),
			marker_pos_type: new FormControl(''),
			font_height: new FormControl(1),
			pos_x: new FormControl(0),
			pos_y: new FormControl(0),
			pos_z: new FormControl(0),
			angle: new FormControl(0),
			should_touch_probe: new FormControl(false)
		});
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "markerRecipe.custom_id",
				title: $localize`Marker Rec. ID`,
				width: 132,
				filterType: 'multi-layer',
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "pos",
				title: $localize`Sequence`,
				width: 132,
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "marker_pos_type",
				title: $localize`Type`,
				width: 150,
				filterType: 'enum',
				filterable: false,
				dropdownList: new MarkerRecipePosTypeClass().getEnumArray(),
				dropdownFilterableList: new MarkerRecipePosTypeClass().getEnumArray(),
				isCustomCell: true,
				hideColumnMenu: true
			},
			{
				name: "font_height",
				title: $localize`Font Height`,
				width: 120,
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "pos_x",
				title: $localize`Pos X`,
				width: 100,
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "pos_y",
				title: $localize`Pos Y`,
				width: 100,
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "pos_z",
				title: $localize`Pos Z`,
				width: 100,
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "angle",
				title: $localize`Angle`,
				width: 100,
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "should_touch_probe",
				title: $localize`Touch Probe`,
				width: 120,
				booleanValue: true,
				filterable: false,
				hideColumnMenu: true
			}
		];
	}

	getEnumTranslateGrid(data: String) {
		return new MarkerRecipePosTypeClass().getStateTranslate(data);
	}

	addNewPos() {
		this.isLoaderEnabled = true;
		this._commonService['get'](`MarkerRecipePos?$filter=marker_recipe_id eq '${ this.recipe.id }'&$orderby=pos desc&$top=1`).subscribe({
			next: (response: any) => {
				this.modalTitle = $localize`Add Position`;
				this.posData = new MarkerRecipePos();
				this.posData.markerRecipe = this.recipe;
				this.posData.marker_pos_type = MarkerRecipePosType.DATA_MATRIX;
				if(response.value && response.value.length) this.posData.pos = response.value[0].pos + 1;
				else this.posData.pos = 1;
				this.isOpenAddPosModal = true;
				this.isNewPos = true;
				this.isLoaderEnabled = false;
			}
		});
	}

	closePosModal() {
		this.isOpenAddPosModal = false;
		if (this.isNewPos) this.isNewPos = false;
	}

	OnChangePosType(data: any) {
		this.posData!.marker_pos_type = data;
	}

	saveRecipePos() {
		this.isLoaderEnabled = true;
		let checkvalidity: any = this.posData?.pos !== undefined && this.posData?.marker_pos_type;

		if (checkvalidity) {
			let validFontHeight = this.posData?.font_height !== undefined && this.posData.font_height >= 1 && this.posData.font_height <= 9999;
			let validPos = this.posData?.pos !== undefined && this.posData.pos > 0;
			let validPosX = this.posData?.pos_x !== undefined && (this.posData!.pos_x === 0 || (this.posData.pos_x > 0 && this.posData.pos_x <= 9999));
			let validPosY = this.posData?.pos_y !== undefined && (this.posData!.pos_y == 0 || (this.posData.pos_y > 0 && this.posData.pos_y <= 9999));
			let validPosZ = this.posData?.pos_z !== undefined && (this.posData!.pos_z == 0 || (this.posData.pos_z > 0 && this.posData.pos_z <= 9999));
			let validAngle = this.posData?.angle !== undefined && (this.posData!.angle == 0 || (this.posData.angle > 0 &&this.posData.angle <= 359));
			const checkCondition = validFontHeight && validPos && validPosX && validPosY && validPosZ && validAngle;
			if(checkCondition) {
				this._commonService['post'](`marker-recipe/save-pos`, this.posData?.toOdata(), false).subscribe({
					next: (response: any) => {
						if (response.success) {
							this.sendRequest();
							this.isOpenAddPosModal = false;
							if (this.isNewPos) this.notification.showSuccess($localize`New pos is added successfully.`);
							else this.notification.showSuccess($localize`Pos is updated successfully.`);
						} else this.notification.showError($localize`Something went wrong. Try again with a new position.`);
						this.isLoaderEnabled = false;
					}, error: (e) => {
						if (e == 'Internal Server Error' && this.posData?.pos)
							this.notification.showError($localize`May be you entered duplicate key for ` + $localize`Position`);
						else this.notification.showError($localize`Something went wrong.`);
						this.isLoaderEnabled = false;
					}
				});
			} else {
				if(!validFontHeight) this.notifications.showError($localize`Insert font height between 1 to 9999.`);
				if(!validPos) this.notifications.showError($localize`Insert valid position.`);
				if(!validPosX || !validPosY || !validPosZ) this.notifications.showError($localize`Insert position (X,Y,Z) between 0 to 9999.`);
				if(!validAngle) this.notifications.showError($localize`Insert angle between 0 to 359.`);
				
				this.isLoaderEnabled = false;
			}
		} else {
			this.notifications.showError($localize`Fill the required fields.`);
			this.isLoaderEnabled = false;
		}
	}

	deleteDataItem(dataItem: any) {
		this.isLoaderEnabled = true;
		this._commonService['post'](`marker-recipe/delete-pos/${ dataItem.id }`, dataItem, false)
			.subscribe({
				next: (response: any) => {
					if (response.success) {
						this.sendRequest();
						this.createLog('delete', dataItem.id, 'marker-recipe-pos');
						this.notifications.showSuccess($localize`Data deleted successfully.`);
					} else this.notifications.showError($localize`Something went wrong.`);
					this.isLoaderEnabled = false;
				},
				error: (e) => {
					this.isLoaderEnabled = false;
					this.notifications.showError($localize`Something went wrong.`);
				}
			})

	}

	onPosClicked(event: any, type: string) {
		if(type == 'grid') {
			this.selectedRecipePos = new MarkerRecipePos().deserialize(event.dataItem);
			this.isViewBlockGrid = true;
		} else {
			this.selectedRecipePos = new MarkerRecipePos().deserialize(event);
			this.isViewBlockGrid = true;
		}
	}

	handleFilter(value: String) {
		this.posTypeList = this.cmbFltr.handleLocalDataFilter(
			value,
			"text"
		);
	}

	onSelectedPos(dataId: number) {
		this.modalTitle = $localize`Edit Position`;
		this.isNewPos = false;
		let data = this.allPosData.find((elm: any) => elm.id == dataId);
		this.posData = new MarkerRecipePos().deserialize(data);
		this.isOpenAddPosModal = true;
	}
}
