import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MarkerRecipe } from '@app/models/marker-recipe';
import { MarkerRecipePos } from '@app/models/marker-recipe-pos';
import { MarkerRecipePosBlock } from '@app/models/marker-recipe-pos-block';
import { GridProperty } from '@app/shared/classes/grid-property';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { CommonService } from '@app/shared/services/common.service';
import { Notification } from '@app/shared/services/notification.service';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { MarkerRecipeService } from './services/marker-recipe.service';
import { Item } from '@app/models/item';
import { Machine } from '@app/models/machine';
import { AuthService } from '@app/services/auth.service';
import { User } from '@app/models/user';

@Component({
	selector: 'app-marker-recipe',
	templateUrl: './marker-recipe.component.html',
	styleUrls: ['./marker-recipe.component.scss']
})
export class MarkerRecipeComponent extends GridProperty implements OnInit {
	private allRecipeData: any = [];
	public isLoaderEnabled: boolean = false;
	public isOpenRecipeDetails: boolean = false;
	public isOpenAddRecipeModal: boolean = false;
	public form!: FormGroup;
	public columns = this.getColumns();
	public itemList: any = [];
	public selectedRecipe: any = {};
	public isNewRecipe: boolean = false;
	public modalTitle: string = '';
	public recipeSearchKey: string = '';
	public recipeData?: MarkerRecipe;
	public ipAddress: string = '';
	public isNewPosDisabled: boolean = false;
	public isViewPosGrid: boolean = false;
	public isClickInfoBtn: boolean = false;
	public rowSelected: number[] = [0];
	public isClickSendDeviceBtn: boolean = false;
	public isDeleteRecipeBtn: boolean = false;
	public selectedRecipeDetails: any;
	public recipeMachineID: number = 0;
	public castMachineList: any = [];
	public isCopyRecipeBtn: boolean = false;
	public machineItemId: any;
	public isEnableSendToPrinter: boolean = false;
	public counterForm!: FormGroup;
	public copyRecipeForm!: FormGroup;
	public isMachineMatched: boolean = false;
	public isEditDisabled: boolean = false;
	public isDeleteDisabled: boolean = false;
	public pccData: any = {
		'recipe_id': '',
		'machine_id': '',
		'data': ''
	};
	public sendDeviceCounter: any = {
		"is_order_manual_setting": false,
		"is_day_manual_setting": false,
		"order_manual_counter": 0,
		"day_manual_counter": 0
	};
	public copyRecipeFormData: any = {
		'machine_id': '',
		'recipe_id': ''
	}

	public editView = {
		actionButton: "Edit",
		actionColumnWidth: 325,
		custom: true,
		isSelection: true,
		hasRemoveCommand: false,
		isHiddenActionColumn: true
	};

	private currentUser!: User;
	public hasUpdatePermission: boolean = false;

	constructor(private route: ActivatedRoute,
		_commonService: CommonService,
		private _markerSrv: MarkerRecipeService,
		protected formBuilder: FormBuilder,
		private notification: Notification,
		private authSrv: AuthService) {
		super(_commonService);
	}

	ngOnInit() {
		this.currentUser = this.authSrv.user;
		this.hasUpdatePermission = this.currentUser && this.currentUser.permissions && 
			(this.currentUser.permissions.includes("CASTVISU_POWER") || 
			this.currentUser.permissions.includes("CASTVISU_ADMIN") || 
			this.currentUser.permissions.includes("CASTVISU_SUPER")) ? true : false

		this.route.queryParams.subscribe((params) => {
			this.ipAddress = params['ip'];
			this.recipeMachineID = params['machine-number'];
			this.machineItemId = params['parts'];
		});

		this.state.take = 50;
		this.url = `MarkerRecipes?$expand=item($select=id,custom_id,name),markerRecipePos($expand=markerRecipePosBlock),machine($select=id,custom_id,name)&$orderby=custom_id desc`;
		this.sendRequest();
		this.getCastMachineList();
		this.getItemList();
		this.getFormStructure();
		if (this.form) this.form.enable();
		if (this.counterForm) this.counterForm.enable();
		if (this.copyRecipeForm) this.copyRecipeForm.enable();
	}

	override sendRequest(): void {
		this.isLoadedEnabled = true;
		this._commonService.getLodata(this.state, this.url).subscribe({
			next: (response: GridDataResult) => {
				this.gridItems = response;
				this.allRecipeData = response.data;
				this.getRecipeFirstItem();
				this.rowSelected = [0];
				this.isLoadedEnabled = false;
			},
			error: (e) => this.isLoadedEnabled = false
		});
	}

	getRecipeFirstItem() {
		if (this.allRecipeData && this.allRecipeData.length > 0)
			this.onRecipeClicked(this.allRecipeData[0], '');
		else {
			this.isViewPosGrid = false;
			this.isNewPosDisabled = true;
		}
	}

	getFormStructure() {
		this.form = this.formBuilder.group({
			custom_id: new FormControl(''),
			name: new FormControl(''),
			machine: new FormControl(),
			item: new FormControl(),
			is_active: new FormControl(false),
			delay: new FormControl(0),
			zaxis: new FormControl(false)
		});
		this.counterForm = this.formBuilder.group({
			is_order_manual_setting: new FormControl(false),
			is_day_manual_setting: new FormControl(false),
			order_manual_counter: new FormControl(0),
			day_manual_counter: new FormControl(0)
		});
		this.copyRecipeForm = this.formBuilder.group({
			machine: new FormControl(),
		})
	}

	getCastMachineList() {
		this._commonService["get"]("Machines?$select=id,custom_id,name&$filter=is_casting_machine eq 1&$top=1000000").subscribe({
			next: (response: any) => {
				this.castMachineList = response.value;
				this.castMachineList = this.castMachineList.map((machine: Machine) => ({
					id: machine.id,
					custom_id: machine.custom_id,
					name: machine.name,
					customText: `${ machine.custom_id } - ${ machine.name }`
				}));
			},
			error: (e) => { },
		});
	}

	getItemList() {
		this._commonService["get"]("Items?$select=id,custom_id,name&$top=1000000").subscribe({
			next: (response: any) => {
				this.itemList = response.value;
				this.itemList = this.itemList.map((item: Item) => ({
					id: item.id,
					custom_id: item.custom_id,
					name: item.name,
					customText: `${ item.custom_id } - ${ item.name }`
				}));
			},
			error: (e) => { },
		});
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`Recipe ID`,
				width: 100,
				filterable: true,
				hideColumnMenu: true
			},
			{
				name: "machine.name",
				title: $localize`Machine`,
				width: 150,
				filterable: true,
				filterType: 'multiLayer',
				sortable: false,
				hideColumnMenu: true
			},
			{
				name: "name",
				title: $localize`Name`,
				width: 150,
				filterable: true,
				hideColumnMenu: true
			},
			{
				name: "is_active",
				title: $localize`Status`,
				width: 98.2,
				booleanValue: true,
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "item.name",
				title: $localize`Item ID`,
				width: 150,
				filterType: 'multiLayer',
				filterable: true,
				sortable: false,
				hideColumnMenu: true
			},
			{
				name: "delay",
				title: $localize`Delay`,
				width: 120,
				filterable: false,
				hideColumnMenu: true
			},
			{
				name: "zaxis",
				title: $localize`Z-Axis`,
				width: 98.2,
				booleanValue: true,
				filterable: false,
				hideColumnMenu: true
			}
		];
	}

	addNewRecipe() {
		this.modalTitle = $localize`Add Recipe`;
		this.recipeData = new MarkerRecipe();
		this.getRecipeCustomId();
	}

	async getRecipeCustomId(isCopy: boolean = false) {
		this.isLoadedEnabled = true;
		const value = await this._commonService.getEntity('MarkerRecipes').catch(() => false);

		if (value) {
			this.recipeData!.custom_id = value;
			if(!isCopy) {
				this.recipeData!.delay = 0;
				this.isOpenAddRecipeModal = true;
				this.isNewRecipe = true;
			} else return value;
		}
		this.isLoadedEnabled = false;
	}

	closeRecipeModal() {
		this.isOpenAddRecipeModal = false;
		if (this.isNewRecipe) this.isNewRecipe = false;
	}

	openCopyConfirmation(data: any) {
		this.modalTitle = $localize`Please Confirm`;
		this.isCopyRecipeBtn = true;
		this.copyRecipeFormData.recipe_id = data.id;
	}

	closeCopyRecipeModal() {
		this.isCopyRecipeBtn = false;
		this.copyRecipeFormData.machine_id = '';
		this.copyRecipeFormData.recipe_id = '';
	}

	copyOldRecipe() {
		this.isLoadedEnabled = true;
		this._commonService['post'](`marker-recipe/copy-recipe/${ this.copyRecipeFormData.recipe_id }`, this.copyRecipeFormData, false).subscribe({
			next: (res: any) => {
				if(res.success) {
					this.isLoadedEnabled = false;
					this.closeCopyRecipeModal();
					this.notification.showSuccess($localize`Recipe is copied successfully.`);
					this.sendRequest();
				} else{
					this.notification.showError($localize`Something went wrong while copying recipe.`);
					this.isLoadedEnabled = false;
					this.closeCopyRecipeModal();
				}
			}, error: (e) => {
				this.notification.showError($localize`Something went wrong while copying recipe.`);
				this.isLoadedEnabled = false;
				this.closeCopyRecipeModal();
			}
		});
	}

	OnChangeMachine(data: any, type: string) {
		if(type != 'copy') this.recipeData!.machine = data;
		else this.copyRecipeFormData.machine_id = data.id;
	}

	OnChangeItem(data: any) {
		this.recipeData!.item = data;
	}

	saveRecipe() {
		this.isLoaderEnabled = true;
		const checkvalidity: any = this.recipeData?.name && this.recipeData.machine;
		if (checkvalidity) {
			const checkDelay = this.recipeData?.delay !== undefined && (this.recipeData.delay === 0 || (this.recipeData.delay > 0 && this.recipeData.delay <= 99)); 
			if(checkDelay) {
				if (this.isNewRecipe) {
					this._commonService['post'](`MarkerRecipes`, this.recipeData?.toOdata()).subscribe({
						next: (response: any) => {
							this.isOpenAddRecipeModal = false;
							this.isLoaderEnabled = false;
							this.notification.showSuccess($localize`New recipe is added successfully.`);
							this.sendRequest();
						}, error: (e) => {
							this.notification.showError($localize`Something went wrong.`);
							this.isLoaderEnabled = false;
						}
					});
				} else {
					this._commonService["put"](`MarkerRecipes(${this.recipeData!.id})`, this.recipeData?.toOdata()).subscribe({
						next: (response: any) => {
							this.isOpenAddRecipeModal = false;
							this.isLoaderEnabled = false;
							this.notification.showSuccess($localize`Recipe is updated successfully.`);
							this.sendRequest();
						}, error: (e) => {
							this.notification.showError($localize`Something went wrong.`);
							this.isLoaderEnabled = false;
						}
					});
				}
			} else {
				this.notifications.showError($localize`Insert delay number between 0 to 99.`);
				this.isLoaderEnabled = false;
			}
		} else {
			this.notifications.showError($localize`Fill the required fields.`);
			this.isLoaderEnabled = false;
		}
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`MarkerRecipes(${dataItem.id})`, dataItem.id, 'MarkerRecipes');
	}

	openDeleteRecipe(item: any) {
		this.modalTitle = $localize`Warning`;
		this.isDeleteRecipeBtn = true;
		this.selectedRecipeDetails = item;
	}

	closeDeleteRecipeModal() {
		this.isDeleteRecipeBtn = false;
	}

	deleteRecipe() {
		this.onRemoveItem(`MarkerRecipes(${ this.selectedRecipeDetails.id })`, this.selectedRecipeDetails.id, 'MarkerRecipes');
		this.closeDeleteRecipeModal();
	}

	/**
	 * Recipe being selected, 
	 * will load the child pos and block of the selected recipe 
	 * @param gridEvent 
	 * @param type 
	 */
	onRecipeClicked(gridEvent: any, type: string) {
		// columnIndex == 7  is the  action column 
		if(type == 'grid' && gridEvent.columnIndex != 7) {    
			this.selectedRecipe = new MarkerRecipe().deserialize(gridEvent.dataItem);
			this.isViewPosGrid = true;
		} else if (type == '' && !gridEvent.hasOwnProperty("columnIndex")){
			this.selectedRecipe = new MarkerRecipe().deserialize(gridEvent);
			this.isViewPosGrid = true;
		}
		if(this.selectedRecipe.machine.custom_id == this.recipeMachineID) {
			this.isEnableSendToPrinter = false;
			this.isMachineMatched = true;
			this.isEditDisabled = false;
			this.isDeleteDisabled = false;
		} else {
			this.isEnableSendToPrinter = false;
			this.isMachineMatched = false;
			this.isEditDisabled = true;
			this.isDeleteDisabled = true;
		}
	}

	openDeviceConfirmation(item: any) {
		this.isLoadedEnabled = true;
		this._commonService['get'](`MarkerRecipes(${ item.id })?$expand=item($select=id,custom_id,name),markerRecipePos($expand=markerRecipePosBlock),machine($select=id,custom_id,name)`).subscribe({
			next: (response: any) => {
				this.isLoadedEnabled = false;
				let enableSend: boolean = false;
				if(response.hasOwnProperty('markerRecipePos') && response.markerRecipePos.length > 0) {
					let pos = response.markerRecipePos;
					for(var i = 0; i < pos.length; i++) {
						if(pos[i].hasOwnProperty('markerRecipePosBlock') && pos[i].markerRecipePosBlock.length > 0) 
							enableSend = true;
						else {
							enableSend = false;
							break;
						}
					}
				} 

				if(enableSend) {
					this.modalTitle = $localize`Recipe ID: (${ response.custom_id })`;
					this.isClickSendDeviceBtn = true;
					this.selectedRecipeDetails = response;
				} else {
					this.notification.showError($localize`Not enough data for sending recipe to device.`);
				}
			}
		});
	}

	closeSendDeviceModal() {
		this.isClickSendDeviceBtn = false;
		this.sendDeviceCounter = {
			"is_order_manual_setting": false,
			"is_day_manual_setting": false,
			"order_manual_counter": 0,
			"day_manual_counter": 0
		}
	}

	sendRecipetoDevice() {
		if(!this.selectedRecipeDetails.item || (this.selectedRecipeDetails.item && !this.machineItemId.includes(this.selectedRecipeDetails.item.custom_id))) {
			this.notification.showWarning($localize`Item is not macthing with castvisu recipe item id.`);
		}
		this.isLoaderEnabled = true;
		this._commonService["get"](`marker-recipe/send-marker-recipe/${ this.selectedRecipeDetails.id }?ip=${this.ipAddress}`, false).subscribe({
			next: (response: any) => {
				this.isLoaderEnabled = false;
				if (response && (response.success || response.status_code == 201))
					this.notification.showSuccess($localize`Recipe is send to the device successfully.`);
				else this.notification.showError($localize`Something went wrong while sending recipe. Please contact to responsible person.`);
				this.closeSendDeviceModal();
			},
			error: (e) => {
				this.notification.showError($localize`Something went wrong.`);
				this.isLoaderEnabled = false;
			},
		});
	}

	onRecipeFilter(event: any, isButtonClicked: boolean = false) {
		if (event.keyCode == 13 || isButtonClicked == true) {
			this.isLoaderEnabled = true;
			let query: string = '';

			if (this.recipeSearchKey) {
				let gridSearchKey = this.recipeSearchKey.trim().toLocaleLowerCase();
				this.columns.forEach((column: any) => {
					let tempFilter: string = '';
					if (column.filterable) {
						if (!column.name.includes('.')) {
							tempFilter = `(contains(${column.name},'${gridSearchKey}'))`;
						} else {
							var col = column.name.split(".")[0];
							var entity = column.name.split(".")[1];
							tempFilter = `(${col}/any(a:contains(a/${entity}, '${gridSearchKey}')))`;
						}
					}
					if (query == '' && tempFilter != '') query = tempFilter;
					else if (tempFilter != '') query += ` or ${tempFilter}`
				})
				this.state.skip = 0;
			}

			this.url = `/MarkerRecipes?$expand=item($select=id,custom_id,name),markerRecipePos($expand=markerRecipePosBlock),machine($select=id,custom_id,name)&$orderby=custom_id desc&$filter=${query}`;
			this.sendRequest();
			this.isLoaderEnabled = false;
		}
	}

	onSelectedRecipe(dataId: number) {
		this.isNewRecipe = false;
		let data = this.allRecipeData.find((elm: any) => elm.id == dataId);
		this.recipeData = new MarkerRecipe().deserialize(data);
		this.modalTitle = $localize`Edit Recipe`;
		this.isOpenAddRecipeModal = true;
	}

	openRecipeInfo() {
		this.modalTitle = $localize`Preview`;
		this.isClickInfoBtn = true;
	}

	closeInfoModal() {
		this.isClickInfoBtn = false;
		this.isEnableSendToPrinter = false;
		this.pccData = {
			'recipe_id': '',
			'machine_id': '',
			'data': ''
		};
	}

	requestDataPCC() {
		this.isLoaderEnabled = true;
		this._commonService["get"](`marker-recipe/request-pcc/${this.ipAddress}/data`, false).subscribe({
			next: (response: any) => {
				this.isLoaderEnabled = false;
				this.pccData.machine_id = this.recipeMachineID;
				this.pccData.recipe_id = response.recipe_id;
				this.pccData.data = response.data;
				this.isEnableSendToPrinter = true;
			},
			error: (e) => {
				this.notification.showError($localize`Something went wrong.`);
				this.isLoaderEnabled = false;
			},
		});
	}

	sendPCCDatatoPrinter() {
		this.isLoaderEnabled = true;
		this._markerSrv.sendDatatoPrinter(this.ipAddress).subscribe({
			next: (response: any) => {
				if(response.message == 'sent!') {
					this.notification.showSuccess($localize`Data send to printer successfully.`);
					this.closeInfoModal();
				} else this.notification.showError($localize`Something went wrong.`);
				this.isLoaderEnabled = false;
			},
			error: (e) => {
				this.notification.showError($localize`Something went wrong.`);
				this.isLoaderEnabled = false;
			}
		});
	}

	onCounterSwitchChange(data: any, type: string) {
		switch(type) {
			case "order_manual_setting":
				this.sendDeviceCounter.is_order_manual_setting = data;
				break;
			case "day_manual_setting":
				this.sendDeviceCounter.is_day_manual_setting = data;
				break;
			default:
				break;
		}
		console.log(this.sendDeviceCounter);
		
	}

	onCounterClickSet(type: string) {
		this.isLoaderEnabled = true;
		if(type == 'order') {
			if(this.sendDeviceCounter.order_manual_counter != undefined && (this.sendDeviceCounter.order_manual_counter == 0 || (this.sendDeviceCounter.order_manual_counter > 0 && this.sendDeviceCounter.order_manual_counter <= 9999999))) {
				this._markerSrv.setOrderCounter(this.ipAddress, this.sendDeviceCounter.order_manual_counter).subscribe({
					next: (response: any) => {
						if(response.message == 'Order Counter set!') {
							this.notification.showSuccess($localize`Counter is set successfully.`);
						} else this.notification.showError($localize`Something went wrong.`);
						this.isLoaderEnabled = false;
					},
					error: (e) => {
						this.notification.showError($localize`Something went wrong.`);
						this.isLoaderEnabled = false;
					}
				});	
			} else {
				this.notification.showError($localize`Set counter between 0 to 9,999,999.`);
				this.isLoaderEnabled = false;
			}
		} 
		else if(type == 'day') {
			if(this.sendDeviceCounter.day_manual_counter != undefined && (this.sendDeviceCounter.day_manual_counter == 0 || (this.sendDeviceCounter.day_manual_counter > 0 && this.sendDeviceCounter.day_manual_counter <= 9999999))) { 
				this._markerSrv.setDayCounter(this.ipAddress, this.sendDeviceCounter.day_manual_counter).subscribe({
					next: (response: any) => {
						if(response.message == 'Day Counter set!') {
							this.notification.showSuccess($localize`Counter is set successfully.`);
						} else this.notification.showError($localize`Something went wrong.`);
						this.isLoaderEnabled = false;
					},
					error: (e) => {
						this.notification.showError($localize`Something went wrong.`);
						this.isLoaderEnabled = false;
					}
				});
			} else {
				this.notification.showError($localize`Set counter between 0 to 9,999,999.`);
				this.isLoaderEnabled = false;
			}
		}
	}
}
