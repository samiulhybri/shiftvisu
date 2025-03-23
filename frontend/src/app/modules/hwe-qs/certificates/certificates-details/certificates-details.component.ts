import { Component, inject, Input } from "@angular/core";
import { HweCertificate } from "@app/models/hwe-certificate";
import { ProdOrderPos } from "@app/models/prod-order-pos";
import { CommonService } from "@shared/services/common.service";
import { ODataBatchCall } from "@app/models/odata-batch-call";
import { ComboFilter } from "@shared/classes/combo-filter";
import { SampleNumber } from "@app/models/sample-number";
import { GridComponent } from "@shared/components/kendo/grid/grid.component";
import { Observable } from "rxjs";
import { HweQsSamplesProdOrderPos } from "@app/models/hew-qs-samples-prod-order-pos";
import { HweCertificateHweQsSample } from "@app/models/hwe-certificate-hwe-qs-sample";
import { PermissionEnum } from "@app/enums/permissions-enum";
import { readCookie } from "@shared/helpers/read-cookie";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { DOCUMENT } from "@angular/common";
import { Calculation } from "@app/models/calculation";

@Component({
	selector: "app-certificates-details",
	templateUrl: "./certificates-details.component.html",
	styleUrls: ["./certificates-details.component.scss"],
})
export class CertificatesDetailsComponent {
	@Input() hweCertificate?: HweCertificate;
	public sampleNumbers: SampleNumber[] = [];
	public cmbSampleNumbers: any;
	calculationUrl?: SafeResourceUrl;
	document = inject(DOCUMENT);
	sanitizer = inject(DomSanitizer);
	public qsSamples: ProdOrderPos[] = [];
	public cmbQsSamples: any;
	public surfaces: ProdOrderPos[] = [];
	public cmbSurfaces: any;
	public heatTreatments: ProdOrderPos[] = [];
	public cmbHeatTreatments: any;
	public ultrasonics: ProdOrderPos[] = [];
	public cmbUltrasonics: any;
	public isLoaderEnabled: boolean = false;
	public oldQsSamples: number[] = [];
	public zzv1: string = "";

	@Input() set data(dataItem: HweCertificate) {
		this.zzv1 = dataItem.zzv1;
		this.hweCertificate = new HweCertificate().deserialize(dataItem);
		this.oldQsSamples = dataItem.hweCertificateHweQsSamples?.map((hweCertificateHweQsSample: HweCertificateHweQsSample) => hweCertificateHweQsSample.id)
			.filter((id): id is number => id !== undefined);
	}

	constructor(private _commonService: CommonService) {
	}

	ngOnInit() {
		if (!this.hweCertificate) this.hweCertificate = new HweCertificate();

		this.getData();
	}

	getData() {
		const odataBatchCalls = [
			new ODataBatchCall(0, "get", `/odata/ProdOrderPos?expand=calculation(expand=calculationDocumentation(select=jominy,product_analysis,grainsize_of_the_component,cleanliness_of_the_component,calculation_id);select=documentation_id,id),salesOrderPos(expand=ValueOfZZV1(select=value_string);select=id),prodOrder(select=custom_id),hweQsSamplesProdOrderPos($expand=hweQsSample)&$select=id,prod_order_id,calculation_id,sales_order_pos_id,pos&top=1000000`),
			new ODataBatchCall(1, "get", `/odata/HweCertificates?top=10000&select(prod_order_pos_id_qs_samples)`),
			new ODataBatchCall(2, "get", `/odata/HweQsSamples?top=10000&select(prod_order_pos_id_qs_samples)`),
		];
		this.isLoaderEnabled = true;
		this._commonService.post("$batch", { requests: odataBatchCalls }).subscribe({
			next: (response: any) => {
				if (response && response.responses) {
					this.sampleNumbers = response.responses[2].body.value;
					this.cmbSampleNumbers = new ComboFilter(this.sampleNumbers);
					this.qsSamples = this.modifyQsSamplesComboData(response.responses[0].body.value, response.responses[1].body.value);
					this.cmbQsSamples = new ComboFilter(this.qsSamples);
					this.ultrasonics = this.modifyComboData(response.responses[0].body.value);
					this.cmbUltrasonics = new ComboFilter(this.ultrasonics);
					this.surfaces = this.modifyComboData(response.responses[0].body.value);
					this.cmbSurfaces = new ComboFilter(this.surfaces);
					this.heatTreatments = this.modifyComboData(response.responses[0].body.value);
					this.cmbHeatTreatments = new ComboFilter(this.heatTreatments);
					this.isLoaderEnabled = false;
				}
			},
			error: (err: any) => {
				console.error("Failed to fetch dropdown data", err);
				this.isLoaderEnabled = false;
			},
		});
	}

	// @ts-ignore
	modifyQsSamplesComboData(data: ProdOrderPos[], qsSample: HweCertificate[] = []) {
		if (data.length == 0) return [];
		const qsSampleId: any[] = [];
		qsSample.map((value: any) => {
			if (this.hweCertificate?.sample?.id != value.prod_order_pos_id_qs_samples) qsSampleId.push(value.prod_order_pos_id_qs_samples);
		});

		const prodOrdersPos: any[] = [];
		type prodOrderPosType = ProdOrderPos &
			{
				salesOrderPos?: any,
				calculation?: Calculation
			};

		data.map((value: prodOrderPosType) => {
			if (qsSampleId.includes(value.id)) return;

			let prod: any = {};
			prod.id = value.id;
			prod.custom_id = `${value.prodOrder?.custom_id} - ${value.pos}`;
			prod.custom_id = `${value.prodOrder?.custom_id} - ${value.pos}`;
			prod.calculation_id = value.calculation_id;
			prod.hweQsSamplesProdOrderPos = value.hweQsSamplesProdOrderPos;
			prod.salesOrderPos = value.salesOrderPos ?? null;
			prod.product_analysis = value?.calculation?.calculationDocumentation?.product_analysis ?? null;
			prod.jominy = value?.calculation?.calculationDocumentation?.jominy ?? null;
			prod.grainsize_of_the_component = value?.calculation?.calculationDocumentation?.grainsize_of_the_component ?? null ?? null;
			prod.cleanliness_of_the_component = value?.calculation?.calculationDocumentation?.cleanliness_of_the_component ?? null;
			prodOrdersPos.push(prod);
		});
		return prodOrdersPos;
	}

	modifyComboData(data: ProdOrderPos[]) {
		if (data.length == 0) return [];
		const prodOrdersPos: any[] = [];
		data.map((value: ProdOrderPos) => {
			let prod: any = {};
			prod.id = value.id;
			prod.custom_id = `${value.prodOrder?.custom_id} - ${value.pos}`;
			prodOrdersPos.push(prod);
		});
		return prodOrdersPos;
	}

	handleFilter(value: String, src: String) {
		switch (src) {
			case "qsSample":
				this.qsSamples =
					this.cmbQsSamples.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "ultrasonic":
				this.ultrasonics =
					this.cmbUltrasonics.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "sampleNumbers":
				this.sampleNumbers =
					this.cmbSampleNumbers.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "surface":
				this.surfaces =
					this.cmbSurfaces.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "heatTreatment":
				this.heatTreatments =
					this.cmbHeatTreatments.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
		}
	}

	qsSampleChange(prodOrderPos: ProdOrderPos & { salesOrderPos?: any }) {
		this.hweCertificate!.ultrasonic = prodOrderPos;
		this.hweCertificate!.surface = prodOrderPos;
		this.hweCertificate!.heatTreatment = prodOrderPos;
		this.hweCertificate!.hweCertificateHweQsSamples = [];
		this.zzv1 = prodOrderPos?.salesOrderPos?.ValueOfZZV1[0]?.value_string ?? "";
		prodOrderPos.hweQsSamplesProdOrderPos.forEach((hweQsSamplesProdOrderPos: HweQsSamplesProdOrderPos) => {
			if (hweQsSamplesProdOrderPos.hweQsSample) {
				let hweQsSample: any = {};
				hweQsSample.hweQsSample = hweQsSamplesProdOrderPos.hweQsSample;
				hweQsSample.note_qs_sample = "";
				this.hweCertificate!.hweCertificateHweQsSamples.push(hweQsSample);
			}
		});

	}

	onAdd(event: PointerEvent, grid: GridComponent) {
		grid.isWindowLoaderEnabled = true;
		if (!this.hweCertificate?.sample?.id) {
			grid.isWindowLoaderEnabled = false;
			return new Observable(observer => {
				observer.error($localize`Order Sampling is required.`);
			});
		}

		return this._commonService.post(`HweCertificates`, this.hweCertificate?.toOdata()).subscribe({
			next: (res: any) => {
				grid.isWindowLoaderEnabled = false;
				grid.closeGridWindow = true;
				grid.gridRefersh.emit();
				grid._notification.showSuccess($localize`Data created successfully`);
			},
			error: (e: any) => {
				grid.isWindowLoaderEnabled = false;
				grid._notification.showError(e ?? $localize`Something went wrong`);
			},
		});

	}

	onUpdate(event: PointerEvent, grid: GridComponent) {
		grid.isWindowLoaderEnabled = true;
		if (!this.hweCertificate?.sample?.id) {
			grid.isWindowLoaderEnabled = false;
			return new Observable(observer => {
				observer.error($localize`Order Sampling is required.`);
			});
		}
		return this.deleteRelationData(grid);

	}

	deleteRelationData(grid: GridComponent) {
		const requests: ODataBatchCall[] = [];
		this.oldQsSamples.map((id: number, index: number) => {
			requests.push(
				new ODataBatchCall(index, "delete", `/odata/HweCertificateHweQsSamples(${id})`),
			);
		});
		this._commonService.post("$batch", { requests }).subscribe({
			next: (response) => {
				this.update(grid);
			},
			error: (e: any) => {
				grid.isWindowLoaderEnabled = false;
				grid._notification.showError(e ?? $localize`Something went wrong`);
			},
		});
	}

	update(grid: GridComponent) {
		this._commonService.put(`HweCertificates(${this.hweCertificate?.id})`, this.hweCertificate?.toOdata()).subscribe({
			next: (res: any) => {
				grid.isWindowLoaderEnabled = false;
				grid.closeGridWindow = true;
				grid.gridRefersh.emit();
				grid._notification.showSuccess($localize`Data updated successfully`);
			},
			error: (e: any) => {
				grid.isWindowLoaderEnabled = false;
				grid._notification.showError(e ?? $localize`Something went wrong`);
			},
		});
	}

	protected readonly permissionEnum = PermissionEnum;

	showCalculationDetails() {
		this.calculationUrl = "";
		let lan = readCookie("sct_language");
		// @ts-ignore
		const url = `${this.document.location.origin}/v11/${lan}/hwe-kalk/calculation/details/${this.hweCertificate.sample?.calculation_id}`;
		this.calculationUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}
}
