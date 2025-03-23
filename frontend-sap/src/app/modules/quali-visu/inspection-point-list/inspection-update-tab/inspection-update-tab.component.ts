import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	OnDestroy
} from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { QualiEventsTypeClass } from "@app/modules/quali-visu/enums/quali-events-type-enum";
import { DataService } from "@app/shared/services/data.service";
import { takeUntil, ReplaySubject } from "rxjs";
import { Machine } from "@app/shared/models/machine.model";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";
import { ProdInspectionOperationFrequencyClass } from "@app/modules/quali-visu/enums/prod-inspection-operation-frequency-enum";
import { InspectionSpecificationImportanceCodeIconType } from "@app/modules/quali-visu/enums/inspection-specification-importance-code-icon-type-enum";
import { InspectionOperationResourceType } from "@app/modules/quali-visu/enums/inspection-operation-resource-type-enum"; 
import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
	selector: "app-inspection-update-tab",
	templateUrl: "./inspection-update-tab.component.html",
	styleUrl: "./inspection-update-tab.component.css",
})
export class InspectionUpdateTabComponent implements OnInit, AfterViewInit, OnDestroy {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	@Input() inspectionPoint: any;
	@Input() selectedInspectionOperation: any;
	@Input() allInspectionPoints: any;
	@Input() userGroupsAvailable: any;
	@Output() assignForm: EventEmitter<any> = new EventEmitter<any>();
	@Output() allConfirmationsFilled: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() allRequiredFieldNoteFilled: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() allCharacteristicsValuesInRange: EventEmitter<boolean> = new EventEmitter<boolean>();

	@ViewChild("characteristicsForm") form?: NgForm;
	@ViewChild("characteristicInput") characteristicInput: any; 

	fileName: string = " ";
	fileSrc!: SafeResourceUrl;
	inspectionOperationDetails: any;
	isInfoDialogueOpen: boolean = false;
	dialogTitle: string = $localize`Info`;
	inspectionItem: any;
	characteristics: any[] = [];
	localization = Localization;
	selectedCharacteristic: any;
	isLoading: boolean = false;
	restructuredDataForGraph: any;
	chartTimeInterval: string = "minute";
	qualiEvents: any = [];
	currentMachine: Machine | undefined;
	frequency: string = "";
	hasSingleCharacteristics: boolean = false;
	singleCharacteristicsDefinitions: any = {
		upperLimit: null,
		lowerLimit: null,
		unit_of_measure: null
	};
	availableResource: any = [];
	availableResourceEquipmentType: any = [];
	availableResourceAttachmentType: any = [];
	selectedInspectionOperationPos: any = "";
	isUserBlocked: boolean = false;

	@Input() set setInspectionPoint(dataItem: any) {
		this.inspectionPoint = dataItem;
	}

	constructor(
		public authService: AuthService,
		private commonService: CommonService,
		private router: Router,
		private dataService: DataService,
		private machineboardService: MachineboardService,
		private qualiVisuService: QualiVisuService,
		private sanitizer: DomSanitizer
	) {
		this.getCurrentMachine();
	}

	ngOnInit() {
		this.getInspectionPointDetails();
		const queryParams = {};
		this.router.navigate([], { queryParams, replaceUrl: false });
		this.machineboardService.isUserBlockedForInspectionPoint$.subscribe({
			next : (res) => {
				this.isUserBlocked = res;
			},
			error: (e) => {

			},
			complete: () => {}
		});
		document.addEventListener('keydown', this.onKeyDown.bind(this));
	}

	ngAfterViewInit(): void {
		this.assignForm.emit(this.form);
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
		document.removeEventListener('keydown', this.onKeyDown.bind(this));
	}

	onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && this.isUserBlocked) {
			event.preventDefault();
			event.stopPropagation();
        	event.stopImmediatePropagation();
		}
	}

	getInspectionPointDetails() {
		if (!this.selectedInspectionOperation?.id) return;

		this.frequency =
			this.getTranslatedFrequency(this.selectedInspectionOperation.frequency) ?? "";

		this.selectedInspectionOperationPos = this.selectedInspectionOperation.pos ?? "";
		
		this.availableResource = this.selectedInspectionOperation?.prod_inspection_operation_resources;

		this.availableResourceEquipmentType = this.availableResource.filter(
			(resource: any) => resource.type === InspectionOperationResourceType.EQUIPMENT
		);

		this.availableResourceAttachmentType = this.availableResource.filter(
			(resource: any) => resource.type === InspectionOperationResourceType.SAP_DOCUMENT
		);

		if(this.availableResourceAttachmentType.length > 0) {
			this.generateAttachmentUrl();
		}

		const inspectionId = this.inspectionPoint?.id;
		this.characteristics = [];
		this.isLoading = true;
		if (inspectionId) {
			this.commonService
				.get(
					`inspection-point/get-inspection-point-details/${this.selectedInspectionOperation?.id}/${inspectionId}`,
					false
				)
				.subscribe({
					next: (res: any) => {
						this.inspectionOperationDetails = res?.prod_order_pos_operation;
						this.inspectionItem = res?.item;
						this.characteristics = res?.options.map((c: any) => {
							return {
								...c,
								iconSrc: c.inspection_specification_importance_code?.icon_type 
									? this.getIconPath(c.inspection_specification_importance_code.icon_type) 
									: null
							};
						});
						this.isLoading = false;
						this.getQualiEventTypes();
						this.checkConfirmationFields();
						this.checkFieldNotes();
					},
					error: err => {
						this.isLoading = false;
					},
				});
		}
	}

	generateAttachmentUrl() {
		this.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.qualiVisuService.getUrlForExternalAttachments(this.availableResourceAttachmentType[0].id));
	}

	getIconPath(iconType: InspectionSpecificationImportanceCodeIconType): string {
		const basePath = '/assets/icons/';
		const fileName = `icon-${iconType.toLowerCase()}.png`;
		return `${basePath}${fileName}`;
	}

	onInputChange() {
		this.checkConfirmationFields();
		this.checkFieldNotes();
		this.checkCharacteristicsValue();
	}

	checkConfirmationFields() {
		const allFilled = this.characteristics.every((char) => {
			const isDisabled = !this.isUserAuthorized(char.user_group_id);
			return isDisabled || (char.confirmation_number && char.confirmation_number !== '');
		});

		const emitValue = this.inspectionOperationDetails?.cavity > 1 ? allFilled : true;
		this.allConfirmationsFilled.emit(emitValue);
	}

	checkFieldNotes() {
		const allNotesFilled = this.characteristics
			.filter((char) => char.is_note_required == 1)
			.every((char) => {
				const isDisabled = !this.isUserAuthorized(char.user_group_id);
				return isDisabled || (char.field_note && char.field_note.trim() !== '');
			});
		this.allRequiredFieldNoteFilled.emit(allNotesFilled);
	}

	checkCharacteristicsValue() {
		const allValueWithinLimits = this.characteristics.every((char) => {
			if (char.inserted_value === null || char.inserted_value === undefined) {
				return true;
			}
			
			if (
				char.value_lower_limit !== undefined && char.value_upper_limit !== undefined
			) {
				return (
					char.inserted_value >= char.value_lower_limit &&
					char.inserted_value <= char.value_upper_limit
				);
			}
			return true;
		});

		this.allCharacteristicsValuesInRange.emit(allValueWithinLimits);
	}

	checkCharacteristicsLength() {
		this.hasSingleCharacteristics = this.allInspectionPoints.every((point: any) => {
			return point.inspection_point_characteristics.length == 1 && point.inspection_point_characteristics[0].inspection_operation_characteristic.is_quantitative == 1
		})

		if(this.hasSingleCharacteristics) {
			let singleCharacteristics = this.allInspectionPoints[0].inspection_point_characteristics[0].inspection_operation_characteristic
			Object.assign(this.singleCharacteristicsDefinitions, {
				lowerLimit: singleCharacteristics.value_lower_limit,
				upperLimit: singleCharacteristics.value_upper_limit,
				unit_of_measure: singleCharacteristics.unit_of_measure
			});

			this.generateGraphAgainstInspectionOperation(singleCharacteristics)
		}
	}

	closeDialog() {
		this.isInfoDialogueOpen = false;
	}

	openPointInfoModal(selectedCharacteristics: any) {
		this.generateGraphAgainstInspectionOperation(selectedCharacteristics);
		this.selectedCharacteristic = selectedCharacteristics;
		this.dialogTitle = this.selectedCharacteristic.name;
		this.isInfoDialogueOpen = true;
	}

	getQualiEventTypes() {
		this.isLoading = true;
		this.commonService
			.get(
				`quali-visu/get-quali-events/${this.currentMachine?.id}/${this.inspectionOperationDetails.id}`,
				false
			)
			.subscribe({
				next: (res: any) => {
					this.qualiEvents = res.map((event: any) => {
						const localDate = new Date(event.registered_datetime + "Z").getTime();
						return {
							label: QualiEventsTypeClass.getTypeTranslate(event.type),
							date: localDate,
						};
					});
					this.checkCharacteristicsLength();
					this.isLoading = false;
				},
				error: err => {
					this.qualiEvents = [];
					this.checkCharacteristicsLength();
					this.isLoading = false;
				},
			});
	}

	getCurrentMachine() {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;
		});
	}

	getTranslatedFrequency(frequency: string) {
		return ProdInspectionOperationFrequencyClass.getTypeTranslate(frequency);
	}

	generateGraphAgainstInspectionOperation(selectedCharacter: any) {
		const selectedCharId = selectedCharacter.id;
		this.restructuredDataForGraph = this.allInspectionPoints
			.flatMap((point: any) =>
				point.inspection_point_characteristics
					?.filter(
						(char: any) =>
							char.inspection_operation_characteristic_id === selectedCharId &&
							char.value !== null
					)
					.map((validChar: any) => {
						const localDate = new Date(point.registered_datetime + "Z");
						return {
							date: localDate.getTime(),
							value: parseFloat(validChar.value),
							user: validChar?.last_modified_by?.name
						};
					})
			)
			.filter((entry: any) => entry !== undefined)
			.sort((a: any, b: any) => a.date - b.date);
	}

	setSelectedOption(characteristic: any, selectedOption: any) {
		characteristic.inspection_operation_characteristic_options.forEach((option: any) => {
			option.is_selected = option.id === selectedOption.id;
		});
	}

	isValueOutsideRange(value?: any, minValue?: any, maxValue?: any, unit: string = "", plausibleMaxLimit?: any, plausibleMinLimit?: any) {
		if (value == "" || !value) {
			return "";
		}

		const numValue = Number(value);
		const numMinValue = Number(minValue);
		const numMaxValue = Number(maxValue);
		const numPlausibleMin = plausibleMinLimit !== null && plausibleMinLimit !== undefined ? Number(plausibleMinLimit) : null;
		const numPlausibleMax = plausibleMaxLimit !== null && plausibleMaxLimit !== undefined ? Number(plausibleMaxLimit) : null;

		if (numPlausibleMin !== null && numValue < numPlausibleMin) {
			return $localize`Plausible Lower Limit Exceeded: ` + numPlausibleMin + (unit ? ` ${unit}` : "");
		}
	
		if (numPlausibleMax !== null && numValue > numPlausibleMax) {
			return $localize`Plausible Upper Limit Exceeded: ` + numPlausibleMax + (unit ? ` ${unit}` : "");
		}
	
		if (minValue !== undefined && numValue < numMinValue) {
			return $localize`Lower Limit Exceeded: ` + numMinValue + (unit ? ` ${unit}` : "");
		}
	
		if (maxValue !== undefined && numValue > numMaxValue) {
			return $localize`Upper Limit Exceeded: ` + numMaxValue + (unit ? ` ${unit}` : "");
		}

		return "";
	}

	getValueStateBasedOnLimit(value?: any, minValue?: any, maxValue?: any, plausibleMinLimit?: any, plausibleMaxLimit?: any): string {
		if (value === "" || value === null || value === undefined) {
			return "";
		}

		const numPlausibleMin = plausibleMinLimit !== null && plausibleMinLimit !== undefined ? Number(plausibleMinLimit) : null;
		const numPlausibleMax = plausibleMaxLimit !== null && plausibleMaxLimit !== undefined ? Number(plausibleMaxLimit) : null;

		if (numPlausibleMin !== null && Number(value) < Number(numPlausibleMin)) {
			return "PlausibleLowerExceeded";
		}
	
		if (numPlausibleMax !== null && Number(value) > Number(numPlausibleMax)) {
			return "PlausibleUpperExceeded";
		}
	
		if (minValue !== undefined && Number(value) < Number(minValue)) {
			return "LowerExceeded";
		}
	
		if (maxValue !== undefined && Number(value) > Number(maxValue)) {
			return "UpperExceeded";
		}

		return "";
	}

	getValueState(c: any, character: any): 'None' | 'Positive' | 'Negative' | 'Critical' {
		if (!(character.touched || character.dirty || c.inserted_value !== null)) {
			return 'None';
		}
	
		if (character.invalid) {
			return 'Negative';
		}
	
		const state = this.getValueStateBasedOnLimit(
			c.inserted_value,
			c.value_lower_limit,
			c.value_upper_limit,
			c?.value_lower_limit_plausible,
			c?.value_upper_limit_plausible
		);
	
		switch (state) {
			case 'PlausibleLowerExceeded':
				return 'Negative';
			case 'PlausibleUpperExceeded':
				return 'Negative';
			case 'LowerExceeded':
				return 'Critical';
			case 'UpperExceeded':
				return 'Critical';
			default:
				return 'None';
		}
	}

	disableArrowKeys(event: KeyboardEvent): void {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
		}
	}

	preventDecimal(event: KeyboardEvent) {
		const charCode = event.key;
		if (charCode === "." || charCode === ",") {
			event.preventDefault();
		}
	}

	isUserAuthorized(userGroupId: number | null): boolean {
		if (userGroupId === null) {
			return true;
		}

		return this.userGroupsAvailable?.some((userGroup: any) => userGroup.id == userGroupId);
	}
}
