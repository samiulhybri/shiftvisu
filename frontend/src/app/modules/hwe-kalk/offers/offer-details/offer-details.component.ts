import { Component, ComponentRef, inject, Input, ViewChild, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { lastValueFrom, Observable, retry, Subscription } from "rxjs";

import { CommonService } from "src/app/shared/services/common.service";
import { SalesOpportunityTypeClass } from "../../enums/SalesOpportunityType";
import { CalculationDetailsComponent } from "../calculation-details/calculation-details.component";
import { OfferPosProductTypeClass } from "../../enums/OfferPosProductType";
import { ComboFilter } from "src/app/shared/classes/combo-filter";
import { Offer } from "src/app/models/offer";
import { OfferPos } from "@app/models/offer-pos";
import { ODataBatchCall } from "@app/models/odata-batch-call";
import { HweKalkService } from "@app/modules/hwe-kalk/hwe-kalk.service";
import { Notification } from "@app/shared/services/notification.service";
import { GridComponent } from "@app/shared/components/kendo/grid/grid.component";
import { OfferStatusClass } from "@app/modules/hwe-kalk/enums/offer-status";
import { OfferPhaseClass } from "@app/modules/hwe-kalk/enums/offer-phase";
import { DeliveryStateClass } from "@app/modules/hwe-kalk/enums/DeliveryState";
import {
	CalculationHeatTreatmentType,
	CalculationHeatTreatmentTypeClass,
} from "@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType";
import { CalculationHeatTreatment } from "@app/models/calculation-heat-treatment";
import { Calculation } from "@app/models/calculation";
import { AuthService } from "@app/services/auth.service";
import { HweKalkLog } from "@app/models/hwe-kalk-log";
import { OfferPosRejectionTypeClass } from "../../enums/OfferPosRejectionType";
import { DialogService } from "@progress/kendo-angular-dialog";
import { OfferPosCostsComponent } from "./offer-pos-costs/offer-pos-costs.component";
import { OfferPosCost } from "@app/models/offer-pos-cost";
import { PermissionEnum } from "@app/enums/permissions-enum";
import { SummaryComponent } from "@app/modules/hwe-kalk/offers/calculation-details/summary/summary.component";
import { ActivatedRoute } from "@angular/router";
import { PriceNoteClass } from "@app/modules/hwe-kalk/enums/PriceNote";
import { AddSuffixOnValuePipe } from "@app/shared/pipes/add-suffix-on-value.pipe";

@Component({
	selector: "app-offer-details",
	templateUrl: "./offer-details.component.html",
	styleUrls: ["./offer-details.component.scss"],
})
export class OfferDetailsComponent {
	public customers: any;
	public permissionEnum = PermissionEnum;
	public deliveryTerms: any;
	public countries: any;
	public salesAreas: any;
	public salesGroups: any;
	public salesOpportunities: any;
	public cmbFltrCustomer: any;
	public cmbSalesOpportunities: any;
	public cmbItems: any;
	public cmbDeliveryTerms: any;
	public cmbCountries: any;
	public cmbSalesAreas: any;
	public cmbSalesGroups: any;
	public showTextArea = "additionInfo";
	public gridInstance!: GridComponent;
	public items: any;
	public isOpenedDialog: boolean = false;
	public isShowAction: boolean = true;
	public requests: ODataBatchCall[] = [];
	public sourceOfferPos: any = [];
	public copyOfferPosPayloadData: any;
	public cmbMaterials: any;
	public materials: any;
	public offerPosFetchUrl?: string;
	public isNew: boolean = false;
	public isNewOffer: boolean = false;
	public isDisabled: boolean = false;
	public isOpenCalDetails: boolean = false;
	public isWindowLoaderEnabled: boolean = false;
	public routerSubscription!: Subscription;
	public customIdSubscription!: Subscription;
	public salesOpportunityType!: Array<{ value: string, text: string }>;
	public offerPosProductType!: Array<{ value: string, text: string }>;
	public heatTreatmentType!: Array<{ value: string, text: string }>;
	public offerStatus!: Array<{ value: string, text: string }>;
	public offerPhases!: Array<{ value: string, text: string }>;
	public deliveryStates!: Array<{ value: string, text: string }>;
	public priceNote!: Array<{ value: string, text: string }>;
	public batchSubscription!: Subscription;
	public submitted = false;
	public isValidate = true;
	public isShowUser = false;
	public offer!: Offer;
	public deletableId: number[] = [];
	public previousFormData?: Offer;
	public form: FormGroup = this.initializeForm();
	formData!: any;
	protected oldOffer!: Offer;
	public cmpRef!: ComponentRef<any>;
	public detailsTitle?: string;
	public authService = inject(AuthService);
	public isSalesOpportunityCreate: boolean = false;
	public matchOfferPosPopUpShow?: boolean = false;
	public selectedOfferPosIndex!: number;
	public offerPosIndex!:number;
	public rejectType = OfferPosRejectionTypeClass.getEnumArray();
	public selectedWindowWidth: string = "95vw";
	public isOfferCost: boolean = false;
	public heatTreatment: any[] = [];
	public  changing_remark : string = ''

	@Input() set data(dataItem: any) {
		this.setInputData(dataItem);
	}

	@ViewChild("modalBody", { read: ViewContainerRef }) modalBody!: ViewContainerRef;

	constructor(protected formBuilder: FormBuilder,
				public _commonService: CommonService,
				public hweKalkService: HweKalkService,
				private _notification: Notification,
				private route: ActivatedRoute,
	) {
	}

	updateOpportunity(offer: Offer) {
		this.gridInstance.isLoadedEnabled = true;
		this._commonService.post("hwe-kalk/update-crm", { id: offer.id }, false)
			.pipe(
				retry(1),
			)
			.subscribe({
				next: (response: any) => {
					this._notification.showSuccess($localize`Updated opportunities phase and link`);
					this.gridInstance.isLoadedEnabled = false;

				},
				error: (error) => {
					this.gridInstance.isLoadedEnabled = false;
					this._notification.showError($localize`Something went wrong for update opportunities phase and link`);
				},
			});

	}

	setInputData(dataItem: any) {
		if (dataItem.is_sales_opportunity) {
			dataItem.salesOpportunity = { ...dataItem };
			dataItem.id = undefined;
			dataItem.is_sales_opportunity = undefined;
			this.offer = new Offer().deserialize(dataItem);

		} else {
			const url = `Offers(${dataItem.id})?expand=isalesGroup,salesArea,deliveryTerm,country,user(select=id,name),customer(select=id,name),offerPos($expand=item($expand=hweClassificationGiesstyp,hweClassificationLieferant,hweClassificationBlockTyp,hweClassificationWerkstoff),material(select=id,custom_id,name),copyForm($expand=offer(select=id,custom_id);select=id,pos),offerPosCosts,calculation(expand=operationPlan($expand=operationPlanPos($expand=operationPlanPosHeatTreatments,machine($expand=costCenter($expand=costCenterCostToday)))),specification(select=id,name,custom_id),heatTreatments,additionalHeatTreatments)),salesOpportunity`
			this._commonService.get(url).subscribe({
				next:(response:any)=>{
					this.offer = new Offer().deserialize(response);
					this.updateOfferPosHeatTreament();
					if (this.offer.status === "OPEN") {
						this.isShowUser = true;
						this.offer.status = "IN_PROCESS_BY";
					    this.updateStatus()
					}
				},
			})
		}
		
	}
	updateStatus(){
		this._commonService.put(`Offers(${this.offer.id})`, { status: "IN_PROCESS_BY" }).subscribe({
			next: (response: any) => {
				this.updateOpportunity(response);
			},
		});
	}

	updateOfferPosHeatTreament() {
		this.offer.offerPos.map((offerPos: OfferPos) => {
			offerPos?.calculation?.heatTreatments.map((heatTreatment: CalculationHeatTreatment) => {
				if (heatTreatment.pos == 10) offerPos.calculation_heat_treatments_type = heatTreatment.type;
			});
		});
	}

	async getOfferCustomId() {
		let value = await this._commonService.getEntity("Offer")
			.catch(() => false);

		this.previousFormData = this.offer;
		if (value) {
			this.offer.custom_id = value;
		}
	}

	ngOnInit() {
		this.getEnumValueWithLang();
		this.batchSalesOpCustomer();

		let offerId = this.route.snapshot.paramMap.get("id");

		if (offerId) {
			this.getOffer(+offerId);
		} else {
			if (this.offer === undefined) {
				this.offer = new Offer();
				this.getOfferCustomId();
			}
		}
		 this.hweKalkService.onCalcUpdateSubject.subscribe((item: boolean) => {
			if (item) {
		      if(this.formData?.id)  this.getOfferPos(this.offerPosIndex,this.formData.id);
				this.formData = undefined;
			}
		});
	  this.hweKalkService.copyOfferPos.subscribe((data: any) => {
			if (data) {
				this.offer.offerPos[data.index] = new OfferPos().deserialize(data.offerPos);
				this.calculationHeatTreatmentsType(this.offer.offerPos[data.index]?.calculation?.heatTreatments[0]?.type, data.index);
				this.offer.offerPos[data.index].calculation_heat_treatments_type = this.offer.offerPos[data.index]?.calculation?.heatTreatments[0]?.type ?? "";
			}
		});

	}
	getOfferPos(offerPosIndex:number, offerPosId:Number){
		this.isWindowLoaderEnabled = true
		let url = `OfferPos(${offerPosId})?$expand=item,material(select=id,custom_id,name),copyForm($expand=offer(select=id,custom_id);select=id,pos),offerPosCosts,calculation($expand=specification(select=id,name,custom_id),heatTreatments,additionalHeatTreatments)`;
		lastValueFrom(this._commonService.get(url)).then((response: any) => {
			this.offer.offerPos[offerPosIndex] = new OfferPos().deserialize(response);
			this.updateOfferPosHeatTreament();
			this.isWindowLoaderEnabled = false
		});
	}

	getOffer(offerId: number) {
		this.isWindowLoaderEnabled = true
		let url = `Offers(${offerId})?expand=salesGroup,salesArea,deliveryTerm,country,user(select=id,name),customer(select=id,name),offerPos($expand=material(select=id,custom_id,name),copyForm($expand=offer(select=id,custom_id);select=id,pos),calculation($expand=specification(select=id,name,custom_id),heatTreatments,additionalHeatTreatments)),salesOpportunity`;
		lastValueFrom(this._commonService.get(url)).then((response: any) => {
			this.setInputData(response);
			this.isWindowLoaderEnabled = false
		});
	}

	createOfferPos(offerId: number | null = null) {
		let newPos = new OfferPos();
		newPos.calculation = new Calculation();
		if (offerId) newPos.offer_id = offerId;
		newPos.pos = this.getPosValue() ?? "";
		return newPos;
	}

	getPosValue() {
		if (this.offer.offerPos.length == 0) return "10";
		else {
			let pos = Number(this.offer.offerPos[this.offer.offerPos.length - 1].pos);
			return pos ? (pos + 10).toString() : "";
		}

	}

	phaseChange(phase: OfferPhaseClass) {
		if (phase) {
			this.offer.status = "OPEN";
		}
	}

	addOfferPos() {
		this.offer?.offerPos?.push(this.createOfferPos(this.offer?.id ?? null));
	}

	batchSalesOpCustomer() {

		this.isWindowLoaderEnabled = true;
		let requests: ODataBatchCall[] = [];
		requests.push(new ODataBatchCall(
			0,
			"get",
			`\/odata\/SalesOpportunities?$top=10000000`),
		);
		requests.push(new ODataBatchCall(
			1,
			"get",
			`\/odata\/Customers?$top=10000000`),
		);

		requests.push(new ODataBatchCall(
			2,
			"get",
			`\/odata\/Materials?$top=10000000`),
		);

		requests.push(new ODataBatchCall(
			3,
			"get",
			`\/odata\/DeliveryTerms?$top=10000000`),
		);

		requests.push(new ODataBatchCall(
			4,
			"get",
			`\/odata\/Countries?$top=10000000`),
		);

		requests.push(new ODataBatchCall(
			5,
			"get",
			`\/odata\/SalesAreas?$top=10000000`),
		);

		requests.push(new ODataBatchCall(
			6,
			"get",
			`\/odata\/SalesGroups?$top=10000000`),
		);

		this.batchSubscription = this._commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.salesOpportunities = response.responses[0].body.value;
				this.customers = response.responses[1].body.value;

				this.materials = response.responses[2].body.value;
				this.deliveryTerms = response.responses[3].body.value;
				this.countries = response.responses[4].body.value;
				this.salesAreas = response.responses[5].body.value;
				this.salesGroups = response.responses[6].body.value;
				this.cmbFltrCustomer = new ComboFilter(this.customers);
				this.cmbSalesOpportunities = new ComboFilter(this.salesOpportunities);
				this.cmbDeliveryTerms = new ComboFilter(this.deliveryTerms);
				this.cmbCountries = new ComboFilter(this.countries);
				this.cmbSalesAreas = new ComboFilter(this.salesAreas);
				this.cmbSalesGroups = new ComboFilter(this.salesGroups);
				this.cmbMaterials = new ComboFilter(this.salesGroups);

				this.cmbMaterials = new ComboFilter(this.materials);
				this.isWindowLoaderEnabled = false;
			},
		});
	}

	getEnumValueWithLang() {
		this.salesOpportunityType = SalesOpportunityTypeClass.getEnumArray();
		this.offerPosProductType = OfferPosProductTypeClass.getEnumArray();
		this.offerStatus = OfferStatusClass.getEnumArray();
		this.offerPhases = OfferPhaseClass.getEnumArray();
		this.deliveryStates = DeliveryStateClass.getEnumArray();
		this.heatTreatmentType = CalculationHeatTreatmentTypeClass.getEnumArray();
		this.priceNote = PriceNoteClass.getEnumArray();
	}

	onAdd(event: PointerEvent, gridComponent: GridComponent) {
		this.gridInstance = gridComponent;

		if (this.offer.id) {
			this.onUpdate(event, gridComponent);
			return;
		}
		this.gridInstance.isWindowLoaderEnabled = true;
		this.submitted = true;
		this.isValidate = true;
		let i = 0;
		this.offer.offerPos.map((data: OfferPos, index: number) => {

			if (!data.pos ||
				!data.pos.trim() ||
				!data.quantity ||
				!data.product_type ||
				!data.delivery_state
			) {
				this.isValidate = false;
			}
		});

		if (!this.isValidate || !this.offer.custom_id || !this.offer.custom_id.trim()) {
			this.gridInstance.isWindowLoaderEnabled = false;
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}

		this.submitted = false;

		if (this.isSalesOpportunityCreate) {
			this.gridInstance.isWindowLoaderEnabled = false;
			this.isOpenedDialog = true;
			return;
		}
		let currentUser = this.authService.user;
		return this._commonService.post("Offers", this.offer.toOdata(true, currentUser)).subscribe({
			next: (response: any) => {
				this.createLog("insert", response.id, "Offer", JSON.stringify(this.offer));
				this.createCalHeatTreatment(response.offerPos, this.offer.offerPos);
				this.updateOpportunity(response);
			},
		});

	}

	onUpdate(evt: PointerEvent, gridComponent: GridComponent) {
		this.gridInstance = gridComponent;

		if (!this.offer.id) {
			this.isSalesOpportunityCreate = true;
			this.onAdd(evt, gridComponent);
			return;
		}
		let idIncrement: number[] = [0];
		this.isValidate = true;
		this.requests = [];
		this.sourceOfferPos = [];
		let offer = new ODataBatchCall(
			idIncrement[0],
			"patch",
			`\/odata\/Offers(${this.offer.id})`,
		);
		let currentUser = this.authService.user;
		offer.body = this.offer.toOdata(false, currentUser);

		this.requests.push(offer);
		idIncrement[0] += 1;
		this.hweKalkService.deleteOfferPosCost?.map((id: number) => {

			this.requests.push(new ODataBatchCall(
				idIncrement[0],
				"delete",
				`\/odata\/OfferPosCosts(${id})`),
			);
			idIncrement[0] += 1;
		});
		this.offer.offerPos.map((offerPos: OfferPos, index: number) => {
			if (!offerPos.pos ||
				!offerPos.pos.trim() ||
				!offerPos.quantity ||
				!offerPos.product_type ||
				!offerPos.delivery_state

			) {
				this.isValidate = false;
				this.submitted = true;
				return;
			}
			let hasIdProperty = offerPos.hasOwnProperty("id");
			let offerdata = new ODataBatchCall(
				idIncrement[0],
				hasIdProperty ? "patch" : "post",
				hasIdProperty ? `\/odata\/OfferPos(${offerPos.id})` : `\/odata\/OfferPos`,
			);
			offerdata.body = {
				...this.offer.offerPos[index].toOdata(hasIdProperty),
				calculation: hasIdProperty ? undefined : [new Calculation().deserialize(offerPos?.calculation).toOdata()],
				offer_id: this.offer.id,
			};
			if (offerPos.calculation_heat_treatments_type && !hasIdProperty) {
				this.heatTreatment.push({
					id: idIncrement[0],
					type: offerPos.calculation_heat_treatments_type,
					pos: 10,
				});
			}
			this.requests.push(offerdata);
			idIncrement[0] += 1;
			if (hasIdProperty) {
				this.offer.offerPos[index].offerPosCosts?.map((offerPosCost: OfferPosCost) => {

					let hasId = offerPosCost.hasOwnProperty("id");
					let cost = new ODataBatchCall(
						idIncrement[0],
						hasId ? "patch" : "post",
						hasId ? `\/odata\/OfferPosCosts(${offerPosCost.id})` : `\/odata\/OfferPosCosts`,
					);
					cost.body = {
						...offerPosCost.toOdata(),
						offer_pos_id: offerPos.id,

					};
					this.requests.push(cost);
					idIncrement[0] += 1;
				});
			}
			if (hasIdProperty) {
				let cal = new Calculation().deserialize(offerPos?.calculation).toOdata(false,true);

				let calculations = new ODataBatchCall(
					idIncrement[0],
					offerPos?.calculation?.id ? "patch" : "post",
					offerPos?.calculation?.id ? `\/odata\/Calculations(${offerPos?.calculation.id})` : `\/odata\/Calculations`,
				);
				calculations.body = {
					...cal,
					offer_pos_id: offerPos.id,
				};
				this.requests.push(calculations);
				idIncrement[0] += 1;
			}

			if (hasIdProperty) this.createUpdateCalHeatTreatment(offerPos, idIncrement, this.requests);
			else {
				if (offerPos.calculation_heat_treatments_type) {
					this.sourceOfferPos = [...this.sourceOfferPos, offerPos];
				}
			}
		});
		if (!this.isValidate || !this.offer.custom_id || !this.offer.custom_id.trim()) {
			this.submitted = true;
			this.gridInstance.isWindowLoaderEnabled = false;
			this._notification.showError($localize`Fill the required fields.`);
			
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}
		this.submitted = false;
		// delete OfferPos
		this.deletableId.map((id: any) => {

			this.requests.push(new ODataBatchCall(
				idIncrement[0],
				"delete",
				`\/odata\/OfferPos(${id})`),
			);
			idIncrement[0] += 1;
		});
		this.isOpenedDialog = true;
		return;

	}

	createLog(event: string, id?: number, entyty?: string, description?: any) {
		if (!this.authService.user) return;
		let logData = {
			loggable_id: id,
			entity: entyty,
			event: event,
			description: description,
			user: this.authService.user,
			changing_remark: this.changing_remark
		};
		let payload = new HweKalkLog().deserialize(logData);
		this._commonService.createLog(payload.toOdata());
	}

	closeDialog(isTrue: boolean) {
		this.gridInstance.isWindowLoaderEnabled = true;
		if (isTrue) {
			if (this.isSalesOpportunityCreate) {
				let currentUser = this.authService.user;
				this._commonService.post("Offers", this.offer.toOdata(true, currentUser)).subscribe({
					next: (response: any) => {
						this.isSalesOpportunityCreate = false;
						this.createLog("insert", response.id, "Offer", JSON.stringify(this.offer));
						this.createCalHeatTreatment(response.offerPos, this.offer.offerPos);
						this.updateOpportunity(response);
					},
				});
			} else {
				let requests = this.requests;
				let currentUser = this.authService.user;
				requests[0].body = this.offer.toOdata(false, currentUser);
				this._commonService.post(`$batch`, { requests })
					.subscribe({
					next: (response: any) => {
						let changes = this.findChanges(this.oldOffer, this.offer);
						this.createLog("update", this.offer.id, "Offer", JSON.stringify(changes));
						if (this.sourceOfferPos.length) this.createHeatTreatmentWhenUpdate(response.responses, this.sourceOfferPos);
						if (this.heatTreatment.length) this.createCalHeat(response);
						else this.showSuccess(0);
						this.updateOpportunity(response.responses[0].body);

					},
					error: (err: any) => {
						this.gridInstance.isWindowLoaderEnabled = false;
						this._notification.showError($localize`Something went wrong`);
					},
				});
			}
		} else this.gridInstance.isWindowLoaderEnabled = false;
		this.isOpenedDialog = false;

	}

	createCalHeat(response: any) {
		let requests: ODataBatchCall[] = [];
		this.heatTreatment.forEach((value: any, index) => {

			let req = new ODataBatchCall(
				index,
				"post",
				"CalculationHeatTreatments",
			);
			req.body = {
				pos: value.pos,
				type: value.type,
				calculation_id: response.responses[value.id]?.body?.calculation[0]?.id,
			};
			requests.push(req);
		});

		this._commonService.post("$batch", { requests }).subscribe();
	}

	/**
	 * change detech when offer edited and add to log
	 * @param oldObj
	 * @param newObj
	 * @param currentPath
	 * @returns
	 */
	findChanges(oldObj: any, newObj: any, currentPath = "") {
		const changes: any = {};
		for (const key in newObj) {
			if (newObj.hasOwnProperty(key)) {
				if (oldObj && oldObj) {
					const path = currentPath ? `${currentPath}.${key}` : key;
					const oldValue = oldObj[key];
					const newValue = newObj[key];

					if (typeof oldValue === "object" && typeof newValue === "object" && oldValue !== null && newValue !== null) {
						// Recursively check nested objects
						const nestedChanges = this.findChanges(oldValue, newValue, path);
						if (Object.keys(nestedChanges).length > 0) {
							changes[path] = nestedChanges;
						}
					} else if (oldValue !== newValue) {
						changes[path] = `Change ${oldValue} to ${newValue}`;
					}
				}
			}
		}

		return changes;
	}


	initializeForm() {
		return this.formBuilder.group({
			id: null,
			custom_id: [null, Validators.required],
			sales_opportunity_id: null,
			customer_id: [null, Validators.required],
			contact_person: null,
			request_date: null,
			offer_until_date: null,
			customer_reference: null,
			type: null,
			additional_info: null,
			changes: null,
			postal_code: null,
			destination: null,
			is_short_offer: 0,
			is_specification_necessary: 0,
			is_sap_relevant: 0,
			is_crm_relevant: 0,
			is_package_price: false,
			sales_note: null,
			delivery_term_id: null,
			country_id: null,
			sales_area_id: null,
			sales_group_id: null,
		});
	}

	handleFilter(value: String, src: String) {
		switch (src) {
			case "customer":
				this.customers = this.cmbFltrCustomer.handleLocalDataFilter(
					value,
					"name",
				);
				break;
			case "sales_opportunity":
				this.salesOpportunities =
					this.cmbSalesOpportunities.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "item":
				this.items =
					this.cmbItems.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "materials":
				this.materials =
					this.cmbMaterials.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "delivery_term":
				this.deliveryTerms =
					this.cmbDeliveryTerms.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "country":
				this.countries =
					this.cmbCountries.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "sales_area":
				this.salesAreas =
					this.cmbSalesAreas.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "sales_group":
				this.salesGroups =
					this.cmbSalesGroups.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
		}
	}

	openModal(formdata: any, index: number, isDisableTab: boolean) {
		this.selectedWindowWidth = "95vw";
		this.formData = formdata;
		this.offerPosIndex = index;
		this.isShowAction = true;

		this.isOpenCalDetails = true;
		if (this.cmpRef) this.cmpRef.destroy();
		this.detailsTitle = undefined;
		this.cmpRef = this.modalBody.createComponent(CalculationDetailsComponent);
		let data = {
			offer: formdata,
			index: index,
		};
		this.cmpRef.setInput("data", data);
		this.hweKalkService.disableTabs =  isDisableTab;
	}

	openOfferPosCostModal(formdata: OfferPos, index: number) {
		this.selectedWindowWidth = "60vw";
		this.formData = formdata;
		this.isShowAction = true;
		this.isOfferCost = true;
		if (this.cmpRef) this.cmpRef.destroy();
		this.detailsTitle = $localize`Details (${formdata.quantity} x ${formdata.calculation!.delivery_weight?.toFixed(2) ?? "?"} kg)`;
		this.cmpRef = this.modalBody.createComponent(OfferPosCostsComponent);

		this.cmpRef.setInput("offerPos", formdata);
	}

	summaryModal(formData: OfferPos, index: number) {

		this.selectedWindowWidth = "60vw";
		this.formData = formData;
		this.isShowAction = false;
		this.isOfferCost = true;
		if (this.cmpRef) this.cmpRef.destroy();
		this.detailsTitle = undefined;
		this.cmpRef = this.modalBody.createComponent(SummaryComponent);
		this.cmpRef.setInput("offerPos", formData);
		this.cmpRef.setInput("calculation", formData.calculation);
		this.cmpRef.setInput("opPlanPos", formData?.calculation?.operationPlan?.operationPlanPos ?? []);
		this.cmpRef.setInput("fromSales", false);
	}

	updateCalculationHandler(event: PointerEvent) {
		if (this.isOfferCost) {
			this.formData = undefined;
			this.isOfferCost = false;
		} else {
			this.cmpRef.instance.onUpdate(event);
		}
	}

	public cancelHandler(): void {
		if (this.isOfferCost) {
			this.isOfferCost = false;
		}
		this.formData = undefined;
		if (this.cmpRef.instance.onCancel) this.cmpRef.instance.onCancel();
	}

	onCancel(dataItem: Offer) {
		if (this.isShowUser) {
			dataItem.status = "IN_PROCESS_BY";
		}
	}

	removeOfferPos(data: any, index: number) {
		this._notification.deleteItem().subscribe({
			next:(result: any) => {
				if (result.action == "next") {
					if (data.hasOwnProperty("id")) this.deletableId.push(data.id);
					this.offer.offerPos.splice(index, 1);
				}
			}, error:(e)=> console.log(e),
		});
	}

	showSuccess(isNew: number) {
		this.gridInstance.isWindowLoaderEnabled = false;
		this.gridInstance.closeGridWindow = true;
		this.gridInstance.gridRefersh.emit();
		if (isNew) this._notification.showSuccess($localize`Data  created successfully`);
		else this._notification.showSuccess($localize`Data updated  successfully`);
	}

	showError() {
		this.gridInstance.isWindowLoaderEnabled = false;
		this._notification.showError($localize`Something went wrong`);
	}

	/**
	 * copy or create all data like  offer, offerpos, calculation ,operation plan pos and heatreatment
	 * this function use normal api call(not use odata)
	 * @param data
	 * @param index
	 */
	showMatchOfferPos(data: OfferPos, index: number) {
		let offer = this.offer?.toOdata();
		offer.id = this.offer.id;
		let offer_pos = data?.toOdata(true);
		offer_pos.id = data.id;
		let payloadData = {
			offer: offer,
			offer_pos: offer_pos,
		};
		this.selectedOfferPosIndex = index;
		this.isWindowLoaderEnabled = true;
		this._commonService.post(`hwe-kalk/get-offer-pos`, payloadData, false).subscribe({
			next: (response: any) => {

				if (!response.offerPos?.length) {
					this._notification.showWarning($localize`No offer pos found in combination of Customer, Customer Material Number and Product Type`);
					this.isWindowLoaderEnabled = false;
				} else if (response.offerPos?.length === 1) {
					this.copyOfferPosData(response.offerPos[0], payloadData.offer_pos.id ?? null);
				} else {

					this.matchOfferPosPopUpShow = true;
					this.offerPosFetchUrl = "hwe-kalk/get-offer-pos";
					this.isWindowLoaderEnabled = false;
					this.copyOfferPosPayloadData = payloadData;
				}

			},

			error: (e) => {
				this.isWindowLoaderEnabled = false;
				this._notification.showError($localize`Something went wrong`);
			},
		});

	}

	public close(): void {
		this.matchOfferPosPopUpShow = false;
	}

	/**
	 * copy or create all data like  offer, offerpos, calculation ,operation plan pos and heatreatment
	 * this function use normal api call(not use odata)
	 * @param data
	 * @param offerposId
	 */
	copyOfferPosData(data: OfferPos, offerposId?: number | null) {
		let offer = this.offer?.toOdata();
		offer.id = this.offer.id;

		let payloadData = {
			offer: offer,
			offer_pos: data,
			offer_pos_id: offerposId ?? this.offer.offerPos[this.selectedOfferPosIndex].id,
		};

		payloadData.offer_pos.pos = this.offer.offerPos[this.selectedOfferPosIndex].pos;

		this.isWindowLoaderEnabled = true;
		this._commonService.post("hwe-kalk/offer-pos/copy", payloadData, false).subscribe({
			next: (respose: any) => {
				if (respose.success) {
					if (!payloadData.offer.id) this.offer.id = respose.offer.id;
					this.getNewOfferPos(data, respose.offerPosId, this.selectedOfferPosIndex);
					this.matchOfferPosPopUpShow = false;
				}
			},
			error: (e) => {
				this.isWindowLoaderEnabled = false;
				this._notification.showError($localize`Something went wrong`);
			},
		});
	}

	/**
	 * get newly created or coped offerpos and set value using model
	 * @param data
	 * @param offerPosId
	 * @param index
	 */
	getNewOfferPos(data: OfferPos, offerPosId: number, index: number) {
		this._commonService.get(`OfferPos(${offerPosId})?$expand=material(select=id,custom_id,name),copyForm($expand=offer(select=id,custom_id);select=id,pos),offerPosCosts,calculation($expand=specification(select=id,name,custom_id),heatTreatments,additionalHeatTreatments)`,
		).subscribe({
			next: (respose: any) => {
				this.offer.offerPos[index] = new OfferPos().deserialize(respose);
				this.calculationHeatTreatmentsType(this.offer.offerPos[index]?.calculation?.heatTreatments[0]?.type, index);
				this.offer.offerPos[index].calculation_heat_treatments_type = this.offer.offerPos[index]?.calculation?.heatTreatments[0]?.type ?? "";
				this.isWindowLoaderEnabled = false;
				this.hweKalkService.copyOfferPos.next(true);
				this._notification.showSuccess($localize`Successfully copy all data`);
			},
		});
	}

	/**
	 *  for copy button show or hide
	 * @param data
	 * @returns
	 */
	isShowCopy(data: OfferPos) {
		return data.customer_material_number && data.pos && this.offer.customer;
	}

	/**
	 * set or unset calculation heat treatment according to the offerpos calculation_heat_treatment
	 * @param value
	 * @param index
	 */
	calculationHeatTreatmentsType(value: any, index: number) {
		let isExistPos10 = false;
		this.offer.offerPos[index]?.calculation?.heatTreatments.map((data: CalculationHeatTreatment, key: number) => {
			if (data.pos === 10) {
				data.type = value;
				isExistPos10 = true;
				if (!value) data.isDeleted = true;
				else data.isDeleted = false;
			}
		});
		if (!isExistPos10) {
			let calHeatTrt = new CalculationHeatTreatment();
			calHeatTrt.pos = 10;
			calHeatTrt.type = value;
			this.offer.offerPos[index]?.calculation?.heatTreatments.unshift(calHeatTrt);
		}

	}

	/**
	 * this function only call only when fresh offer and offerpos create(fron onAdd method)
	 * create calculation heat treatment only for heat treatment pos 10
	 * if ofeerpos calculation_heat_treatments_type set then create then create new calculation heat treatment for pos 10 with calculation
	 */
	createCalHeatTreatment(newOfferPos: any, sourceOfferPos: any) {
		let requests: ODataBatchCall[] = [];
		let idIncrement = 0;
		for (const index in newOfferPos) {
			if (sourceOfferPos[Number(index)].calculation_heat_treatments_type) {
				let calculation = new Calculation();
				calculation.offer_pos_id = newOfferPos[index].id;
				let heatTreatment = this.setHeatTreatment(sourceOfferPos[Number(index)].calculation_heat_treatments_type);
				calculation.heatTreatments.push(heatTreatment);

				let calculationWithHeatTreatments = new ODataBatchCall(
					idIncrement,
					"post",
					`\/odata\/Calculations`,
				);
				calculationWithHeatTreatments.body = {
					...calculation.toOdata(true),
				};
				requests.push(calculationWithHeatTreatments);
				idIncrement += 1;
			}
		}
		if (requests.length) {
			this._commonService.post("$batch", { requests }).subscribe({
				next: (res: any) => {
					this.showSuccess(1);
				},
			});
		} else this.showSuccess(1);


	}

	/**
	 * this function only call when update offer and offerpos (from on update method)
	 * create calculation heat treatment only for heat treatment pos 10
	 * if ofeerpos calculation_heat_treatments_type set then create new calculation heat treatment for pos 10
	 */
	createUpdateCalHeatTreatment(offerPos: any, idIncrement: number[], requests: any) {
		offerPos?.calculation?.heatTreatments?.map((heatTreamtment: CalculationHeatTreatment) => {
			if (!heatTreamtment.isDeleted && heatTreamtment.pos === 10 && heatTreamtment.hasOwnProperty("id")) {
				let heatTreatmentData = new ODataBatchCall(
					idIncrement[0],
					"patch",
					`\/odata\/CalculationHeatTreatments(${heatTreamtment.id})`,
				);
				heatTreatmentData.body = {
					...heatTreamtment.toOdata(),
				};
				requests.push(heatTreatmentData);
				idIncrement[0] += 1;
			} else if (heatTreamtment.isDeleted && heatTreamtment.id && heatTreamtment.pos === 10) {

				let requestData = new ODataBatchCall(
					idIncrement[0],
					"delete",
					`\/odata\/CalculationHeatTreatments(${heatTreamtment.id})`,
				);
				requests.push(requestData);
				idIncrement[0] += 1;
			} else if (!heatTreamtment.isDeleted && heatTreamtment.pos === 10 && !heatTreamtment.hasOwnProperty("id")) {

				if (offerPos?.calculation?.id) {
					let heatTreatmentData = new ODataBatchCall(
						idIncrement[0],
						"post",
						`\/odata\/CalculationHeatTreatments`,
					);
					heatTreatmentData.body = {
						...heatTreamtment.toOdata(),
						calculation_id: offerPos?.calculation?.id,
					};
					requests.push(heatTreatmentData);
				} else {
					let calculation = new Calculation();
					calculation.offer_pos_id = offerPos.id;
					calculation.heatTreatments.push(heatTreamtment.toOdata());
					let calculationData = new ODataBatchCall(
						idIncrement[0],
						"post",
						`\/odata\/Calculations`,
					);
					calculationData.body = {
						...calculation.toOdata(true),
					};
					requests.push(calculationData);
				}
				idIncrement[0] += 1;
			}
		});
	}

	/**
	 * this function call when update some offerpos alogn with some new offerpos with calculation heat treatments type
	 * @param responses
	 * @param sourceOfferPos
	 */
	createHeatTreatmentWhenUpdate(responses: any, sourceOfferPos: any) {
		responses = responses.filter((response: any) => response.status == 201 && response.body.pos);
		let requests: ODataBatchCall[] = [];
		let idIncrement = 0;
		for (const index in sourceOfferPos) {
			responses.map((data: any) => {
				if (data.body.pos == sourceOfferPos[Number(index)].pos) {
					let calculation = new Calculation();
					calculation.offer_pos_id = data.body.id;
					let heatTreatment = this.setHeatTreatment(sourceOfferPos[Number(index)].calculation_heat_treatments_type);
					calculation.heatTreatments.push(heatTreatment);

					let calculationWithHeatTreatments = new ODataBatchCall(
						idIncrement,
						"post",
						`\/odata\/Calculations`,
					);
					calculationWithHeatTreatments.body = {
						...calculation.toOdata(true),
					};
					requests.push(calculationWithHeatTreatments);
					idIncrement += 1;
				}
			});

			this._commonService.post("$batch", { requests }).subscribe({
				next: (res: any) => {
					this.showSuccess(0);
				},
			});
		}

	}

	/**
	 * set heat treatment data for create
	 * @param calHeatTrtype
	 * @returns
	 */
	setHeatTreatment(calHeatTrtype: CalculationHeatTreatmentType) {
		let heatTreatment = new CalculationHeatTreatment();
		heatTreatment.pos = 10;
		heatTreatment.isDeleted = undefined;
		heatTreatment.type = calHeatTrtype ?? undefined;
		return heatTreatment;
	}

	openCrmUrl() {
		if (this.offer.salesOpportunity?.crm_id) {
			window.open(`https://hwetest.crm4.dynamics.com/main.aspx?appid=8cafad08-cd62-41d5-bdd1-f3045cc8e5a9&forceUCI=1&pagetype=entityrecord&etn=opportunity&id=${this.offer.salesOpportunity?.crm_id}`);
		}
	}

	isPermissionValidate(permission: string): boolean {
		return this.authService.isPermissionValidate(permission);
	}

	tabSelectEvent(event: any) {
		const sales = this.permissionEnum.HWEKALK_SALES_VIEW;
		const pos = this.permissionEnum.HWEKALK_SALES_VIEW;
		if (this.isPermissionValidate(sales) && this.isPermissionValidate(pos)) {
			if (event.index == 0) this.showTextArea = "additionInfo";
			else this.showTextArea = "salesNote";
		} else if (this.isPermissionValidate(sales)) this.showTextArea = "salesNote";
		else if (this.isPermissionValidate(pos)) this.showTextArea = "additionInfo";
	}

	offerPosPermission(data: OfferPos) {
		return data.id ? !this.isPermissionValidate(this.permissionEnum.HWEKALK_OFFER_POS_EDIT)
			: !this.isPermissionValidate(this.permissionEnum.HWEKALK_OFFER_POS_CREATE);

	}

	offerSalesPermission() {
		return (!this.isPermissionValidate(this.permissionEnum.HWEKALK_SALES_EDIT));
	}

	offerPermission() {

		return this.offer.id ? this.isPermissionValidate(this.permissionEnum.HWEKALK_OFFER_EDIT)

			: this.isPermissionValidate(this.permissionEnum.HWEKALK_OFFER_CREATE);
	}
}