import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MarkerRecipeBlockType, MarkerRecipeBlockTypeClass } from '@app/enums/marker-recipe-block-type';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { GridProperty } from '@app/shared/classes/grid-property';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { CommonService } from '@app/shared/services/common.service';
import { Notification } from '@app/shared/services/notification.service';
import { MarkerRecipePosBlock } from '@app/models/marker-recipe-pos-block';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { MarkerRecipePos } from '@app/models/marker-recipe-pos';
import { DateTimeFormats } from './datetime-formats';
import { User } from '@app/models/user';
import { AuthService } from '@app/services/auth.service';

@Component({
	selector: 'app-marker-block',
	templateUrl: './marker-block.component.html',
	styleUrls: ['./marker-block.component.scss']
})
export class MarkerBlockComponent extends GridProperty {
	@Input() pos?: MarkerRecipePos;
	@Input() isGridVisible!: boolean;
	@Input() isNewBtnDisable!: boolean;
	@Input() isMachineMatched!: boolean;
	
	private allBlockData: any = [];
	public blockData?: MarkerRecipePosBlock;
	public isLoaderEnabled: boolean = false;
	public isOpenAddBlockModal: boolean = false;
	public form!: FormGroup;
	public columns = this.getColumns();
	public blockTypeList!: Array<{ value: string; text: string }>;
	public cmbFltr: any;
	public isNewBlock: boolean = false;
	public modalTitle: string = '';
	public ascii_character: any = '';
	public rowSelected: number[] = [0];
	public dateTimeList: any = DateTimeFormats.list;
	public isEditDisabled: boolean = false;
	public isDeleteDisabled: boolean = false;

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
		this.pos = change.pos ? change.pos.currentValue : this.pos;
		this.isGridVisible = change.isGridVisible ? change.isGridVisible.currentValue : this.isGridVisible;
		this.isNewBtnDisable = change.isNewBtnDisable ? change.isNewBtnDisable.currentValue : this.isNewBtnDisable;
		this.isMachineMatched = change.isMachineMatched ? change.isMachineMatched.currentValue : this.isMachineMatched;
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

		this.blockTypeList = new MarkerRecipeBlockTypeClass().getEnumArray();
		this.cmbFltr = new ComboFilter(this.blockTypeList);
		this.state.take = 50;
		
		if (this.pos && this.isGridVisible) {
			this.url = `MarkerRecipePosBlocks?$filter=marker_recipe_pos_id eq '${this.pos.id}'&expand=markerRecipePos&$orderby=order`;
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
				this.allBlockData = response.data;
				this.isLoadedEnabled = false;
			},
			error: (e) => this.isLoadedEnabled = false
		});
	}

	getCustomColumnData(item: any) {
		let result: any;
		if (item.marker_block_type == MarkerRecipeBlockType.TEXT) result = decodeURIComponent(item.text.replace(/\+/g, ' '));
		else if (item.marker_block_type == MarkerRecipeBlockType.ASCII_CHARACTER) result = this.onChangeAscii(item.ascii_dec);
		else if (item.marker_block_type == MarkerRecipeBlockType.DATETIME) result = item.date_time_format_string;
		else if (item.marker_block_type == MarkerRecipeBlockType.DAY_COUNTER || item.marker_block_type == MarkerRecipeBlockType.ORDER_COUNTER)
			result = item.shot_counter_length;

		return result;
	}

	getFormStructure() {
		this.form = this.formBuilder.group({
			order: new FormControl(1),
			marker_block_type: new FormControl(''),
			text: new FormControl(''),
			ascii_dec: new FormControl(0),
			shot_counter_length: new FormControl(1),
			date_time_format_string: new FormControl(''),
			notes: new FormControl('')
		});
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "order",
				title: $localize`Sequence`,
				width: 110,
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "marker_block_type",
				title: $localize`Block Type`,
				width: 120,
				filterType: 'enum',
				filterable: false,
				dropdownList: new MarkerRecipeBlockTypeClass().getEnumArray(),
				dropdownFilterableList: new MarkerRecipeBlockTypeClass().getEnumArray(),
				isCustomCell: true,
				hideColumnMenu: true
			},
			{
				name: "custom_column",
				title: $localize`Content`,
				width: 150,
				filterable: false,
				isCustomCell: true,
				hideColumnMenu: true
			},
			{
				name: "notes",
				title: $localize`Note`,
				width: 350,
				filterable: false,
				hideColumnMenu: true
			}
		];
	}

	getEnumTranslateGrid(data: String) {
		return new MarkerRecipeBlockTypeClass().getStateTranslate(data);
	}

	addNewBlock() {
		this.isLoaderEnabled = true;
		this._commonService['get'](`MarkerRecipePosBlocks?$filter=marker_recipe_pos_id eq '${ this.pos!.id }'&expand=markerRecipePos&$orderby=order desc&$top=1`).subscribe({
			next: (response: any) => {
				this.modalTitle = $localize`Add Block`;
				this.blockData = new MarkerRecipePosBlock();
				this.blockData.markerRecipePos = this.pos;
				this.blockData.marker_block_type = MarkerRecipeBlockType.TEXT;
				if(response.value && response.value.length) this.blockData.order = response.value[0].order + 1;
				else this.blockData.order = 1;
				this.isOpenAddBlockModal = true;
				this.isNewBlock = true;
				this.isLoaderEnabled = false;
			}
		});
	}

	closeBlockModal() {
		this.isOpenAddBlockModal = false;
		if (this.isNewBlock) this.isNewBlock = false;
	}

	OnChangeBlockType(data: any) {
		this.blockData!.marker_block_type = data;
	}

	/**
	 * 
	 * @param data  ASCII CODE
	 * @returns ASCII character 
	 * characters in the range 0 to 31 (inclusive), these are often control characters, 
	 * such as newline (\n), carriage return (\r), tab (\t), etc
	 * When you use String.fromCharCode with values less than 32, you might not see visible characters, 
	 * and the behavior depends on the specific control character.
	 */
	onChangeAscii(data: any) {
		if (data <= 32) {
			const controlCharacterNames = [
				'NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL',
				'BS', 'HT', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI',
				'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB',
				'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US', 'SP'
			];
			return controlCharacterNames[data];
		} else return String.fromCharCode(data);
	}

	checkSavingDataValidity() {
		this.isLoaderEnabled = true;
		let checkvalidity: any = this.blockData?.marker_block_type && this.blockData.order;
		if (this.blockData?.marker_block_type == MarkerRecipeBlockType.TEXT) checkvalidity = checkvalidity && (this.blockData.text !== undefined && this.blockData.text !== '');
		if (this.blockData?.marker_block_type == MarkerRecipeBlockType.ASCII_CHARACTER) checkvalidity = checkvalidity && this.blockData.ascii_dec !== undefined;
		if (this.blockData?.marker_block_type == MarkerRecipeBlockType.DAY_COUNTER || this.blockData?.marker_block_type == MarkerRecipeBlockType.ORDER_COUNTER)
			checkvalidity = checkvalidity && this.blockData?.shot_counter_length !== undefined;
		if (this.blockData?.marker_block_type == MarkerRecipeBlockType.DATETIME) checkvalidity = checkvalidity && this.blockData?.date_time_format_string !== undefined;

		if (checkvalidity) {
			if (this.blockData?.marker_block_type == MarkerRecipeBlockType.TEXT) {
				const textControl = this.form.get('text');
				if (textControl?.value && textControl.value.length > 80) {
					textControl.setErrors({ 'maxLengthExceeded': true });
					this.notifications.showError($localize`Text max length should be 80.`);
					this.isLoaderEnabled = false;
				} else {
					textControl?.setErrors(null);
					this.savePosBlock();
				}
			} else if (this.blockData?.marker_block_type == MarkerRecipeBlockType.ASCII_CHARACTER) {
				let valid = this.blockData?.ascii_dec !== undefined && (this.blockData.ascii_dec > 15 && this.blockData.ascii_dec <= 255);
				if (valid) this.savePosBlock();
				else {
					this.notifications.showError($localize`Insert ASCII value between 16 to 255 only.`);
					this.isLoaderEnabled = false;
				}
			} else if (this.blockData?.marker_block_type == MarkerRecipeBlockType.DAY_COUNTER || this.blockData?.marker_block_type == MarkerRecipeBlockType.ORDER_COUNTER) {
				let valid = this.blockData?.shot_counter_length !== undefined && (this.blockData.shot_counter_length >= 1 && this.blockData.shot_counter_length <= 10);
				if (valid) this.savePosBlock();
				else {
					this.notifications.showError($localize`Insert counter length between 1 to 10.`);
					this.isLoaderEnabled = false;
				}
			} else this.savePosBlock();
		} else {
			this.notifications.showError($localize`Fill the required fields.`);
			this.isLoaderEnabled = false;
		}
	}

	savePosBlock() {
		this._commonService['post'](`marker-recipe/save-block`, this.blockData?.toOdata(), false).subscribe({
			next: (response: any) => {
				if (response.success) {
					this.sendRequest();
					this.isOpenAddBlockModal = false;
					if (this.isNewBlock) this.notification.showSuccess($localize`New block is added successfully.`);
					else this.notification.showSuccess($localize`Block is updated successfully.`);
				} else this.notification.showError($localize`Something went wrong. Try again with a new order.`);
				this.isLoaderEnabled = false;
			}, error: (e) => {
				if (e == 'Internal Server Error' && this.blockData?.order)
					this.notification.showError($localize`May be you entered duplicate key for ` + $localize`Sequence`);
				else this.notification.showError($localize`Something went wrong.`);
				this.isLoaderEnabled = false;
			}
		});
	}

	deleteDataItem(dataItem: any) {
		this.isLoaderEnabled = true;
		this._commonService['post'](`marker-recipe/delete-block/${dataItem.id}`, dataItem, false)
			.subscribe({
				next: (response: any) => {
					if (response.success) {
						this.sendRequest();
						this.createLog('delete', dataItem.id, 'marker-recipe-pos-block');
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

	handleFilter(value: String) {
		this.blockTypeList = this.cmbFltr.handleLocalDataFilter(
			value,
			"text"
		);
	}

	onSelectedBlock(dataId: number) {
		this.modalTitle = $localize`Edit Block`;
		this.isNewBlock = false;
		let data = this.allBlockData.find((elm: any) => elm.id == dataId);
		this.blockData = new MarkerRecipePosBlock().deserialize(data);
		this.isOpenAddBlockModal = true;
	}

	onChangeTextType() {
		const textControl = this.form.get('text');
		if (textControl?.value && textControl.value.length > 80) {
			textControl.setErrors({ 'maxLengthExceeded': true });
		} 
	}
}