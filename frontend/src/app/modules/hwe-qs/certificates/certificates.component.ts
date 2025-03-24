import { Component } from "@angular/core";
import { GridProperty } from "@shared/classes/grid-property";
import { CommonService } from "@shared/services/common.service";
import { GridColumn } from "@shared/models/grid-column.model";
import {
	CertificatesDetailsComponent,
} from "@app/modules/hwe-qs/certificates/certificates-details/certificates-details.component";
import { GridDataResult } from "@progress/kendo-angular-grid";
import { map } from "rxjs/operators";
import { HweCertificate } from "@app/models/hwe-certificate";
import Attachment from "@shared/models/Attachment";
import { readCookie } from "@shared/helpers/read-cookie";

@Component({
	selector: "app-certificates",
	templateUrl: "./certificates.component.html",
	styleUrls: ["./certificates.component.scss"],
})
export class CertificatesComponent extends GridProperty {
	public columns = this.getColumns();
	isLoaderEnabled: boolean = false;
	showPdfDialog: boolean = false;
	attachmentFiles:any=[];
	public editView = {
		actionButton: "edit",
		modalTemplate: CertificatesDetailsComponent,
		modalWidth: "60vw",
		isCustomizedHandler: true,
		isOnPageFilter: true,
		actionColumnWidth: 180

	};
	public toolbarConfig = {
		title: $localize`Certificate`,
		hasAddCommand: true,
		hasSearch: true,
	};
	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService);
    this.state.take = 100000;
		this.url = `HweCertificates?$expand=hweCertificateHweQsSamples(expand=hweQsSample),sample(expand=calculation(expand=calculationDocumentation(select=calculation_id,jominy,product_analysis,grainsize_of_the_component,cleanliness_of_the_component);select=documentation_id,id),salesOrderPos(expand=ValueOfZZV1(select=value_string);select=id),prodOrder(select=id,custom_id);select=id,pos,calculation_id),ultrasonic(expand=prodOrder(select=id,custom_id);select=id,pos),surface(expand=prodOrder(select=id,custom_id);select=id,pos),heatTreatment(expand=prodOrder(select=id,custom_id);select=id,pos)&orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`HweCertificates(${dataItem.id})`);
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "order_sampling",
				title: $localize`Order Sampling`,
				filterable: true,
			},
			{
				name: "order_ultrasonic",
				title: $localize`Order Ultrasonic`,
				filterable: true,
			},
			{
				name: "order_surface",
				title: $localize`Order Surface`,
				filterable: true,
			},
			{
				name: "order_heat_treatment",
				title: $localize`Order Heat Treatment`,
				filterable: true,
			},
		];
	}

	public override sendRequest(urlFilter?: string): void {
		this.isLoadedEnabled = true;
		this._commonService
			.getLodata(this.state, this.url, urlFilter)
			.pipe(
				map((response: GridDataResult) => {
					return this.refactorResponseData(response);
				})
			)
			.subscribe({
				next: (response: GridDataResult) => {
					this.gridItems = response.data;
					this.isLoadedEnabled = false;
				},
				error: e => (this.isLoadedEnabled = false),
			});
	}

	refactorResponseData(response: GridDataResult) {
		const certificate: any = [];
		response.data.forEach((value: any) => {
			let hweData: any = {};
			hweData.order_sampling = this.getProdOrderPos(
				value?.sample?.prodOrder?.custom_id,
				value?.sample?.pos
			);
			hweData.order_ultrasonic = this.getProdOrderPos(
				value?.ultrasonic?.prodOrder?.custom_id,
				value?.ultrasonic?.pos
			);
			hweData.order_surface = this.getProdOrderPos(
				value?.surface?.prodOrder?.custom_id,
				value?.surface?.pos
			);
			hweData.order_heat_treatment = this.getProdOrderPos(
				value?.heatTreatment?.prodOrder?.custom_id,
				value?.heatTreatment?.pos
			);
			hweData.sample = value?.sample;
			hweData.sample.product_analysis = value?.sample?.calculation?.calculationDocumentation?.product_analysis;
			hweData.sample.jominy = value?.sample?.calculation?.calculationDocumentation?.jominy;
			hweData.sample.grainsize_of_the_component = value?.sample?.calculation?.calculationDocumentation?.grainsize_of_the_component;
			hweData.sample.cleanliness_of_the_component = value?.sample?.calculation?.calculationDocumentation?.cleanliness_of_the_component;
			hweData.ultrasonic = value?.ultrasonic;
			hweData.surface = value?.surface;
			hweData.id = value?.id;
			hweData.heatTreatment = value?.heatTreatment;
			hweData.note_ultrasonic = value?.note_ultrasonic;
			hweData.note_surface = value?.note_surface;
			hweData.note_heat_treatment = value?.note_heat_treatment;
			hweData.hweCertificateHweQsSamples = value?.hweCertificateHweQsSamples;
			hweData.test_no = value?.test_no;
			hweData.is_show_chemical_analysis = value?.is_show_chemical_analysis;
			hweData.is_show_grain_size_determination = value?.is_show_grain_size_determination;
			hweData.is_show_purity_determination = value?.is_show_purity_determination;
			hweData.is_show_jominy_test = value?.is_show_jominy_test;
			hweData.calculation_id = value?.sample?.calculation_id;
			hweData.test_result_note = value?.test_result_note;
			hweData.hardness_note = value?.hardness_note;
			hweData.note_attachment = value?.note_attachment;
			hweData.inspection_no = value?.inspection_no;
			hweData.rev = value?.rev;
			hweData.zzv1 = value?.sample.salesOrderPos?.ValueOfZZV1[0]?.value_string ?? null;
			certificate.push(hweData);
		});
		return { data: certificate, total: response.total };
	}

	getProdOrderPos(custom_id: string, pos: string) {
		return custom_id && pos ? `${custom_id}-${pos}` : custom_id ? custom_id : pos;
	}

	generatePdfOrText(certificate: HweCertificate, isText: number) {
		this.isLoaderEnabled = true;
		this.attachmentFiles = [];
		this.showPdfDialog =  true;
		let lan = readCookie('sct_language');
		this._commonService.post(`hwe-qs/get-pdf/${certificate.id}/${lan}/${isText}`, [], false).subscribe(
			{
				next: (response: any) => {
					this.isLoaderEnabled = false;
                   response.forEach((value:any)=>{

					   let content = {
                           name: value.name,
						   original_url :value.pdf,
						   mime_type : isText ? 'text' : 'pdf'
					   }
					    this.attachmentFiles.push( new Attachment().deserialize(content));
				   })
				},
				error: e => {
					console.log(e);
					this.isLoaderEnabled = false;
				},
			}
		);
	}

	public close(status: string): void {
		//	this.showPdfDialog = false;
	}
}
