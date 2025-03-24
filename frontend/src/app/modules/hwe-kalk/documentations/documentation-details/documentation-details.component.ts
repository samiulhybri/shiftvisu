import { Component, Input } from '@angular/core';
import { Observable, switchMap, catchError } from 'rxjs';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { Documentation } from '@app/models/documentation';
import { DocumentationCertificate } from '@app/models/documentation-certificate';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { CommonService } from "@app/shared/services/common.service";
import { DocumentationCertificateClass } from '@app/modules/hwe-kalk/enums/DocumentationCertificate';
import { CalculationDocumentation } from '@app/models/calculation-documentation';
import { MarkingClass } from '@app/modules/hwe-kalk/enums/Marking';

@Component({
	selector: 'app-documentation-details',
	templateUrl: './documentation-details.component.html',
	styleUrls: ['./documentation-details.component.scss']
})
export class DocumentationDetailsComponent {
	public certificateData!: DocumentationCertificate[];
	public cmbDocumentationCertificateData!: any;
    public markingData!: Array<{ value: string, text: string }>;
	public oldData: any = {
		certificates: [],
	}
	documentation?:Documentation | CalculationDocumentation;
	disabledCustomId	 = false
	@Input() set data(dataItem:Documentation | CalculationDocumentation){
		this.documentation  = dataItem;
		if (dataItem instanceof CalculationDocumentation) {
			 this.disabledCustomId = true;
		 }
		this.setDocumentation();
	};
	@Input() isAllDisabled: boolean = false;
	@Input() fromCalculationDocumentation: boolean = false;

	public isLoaderEnabled: boolean = false;

	constructor(public _commonService: CommonService) {
		this.getEnums();
		
	}
	setDocumentation(){
		if(!this.fromCalculationDocumentation){
			if (!this.documentation) {
				this.documentation = new Documentation();
				this.getCustomId();
			} else {
				this.documentation = new Documentation().deserialize(this.documentation);
				this.oldData.certificates = this.documentation?.certificates?.map((value: any) => value.id) ?? [];
			}
		}
	}
   
	ngOnInit() {
		if(!this.documentation) this.setDocumentation();
	}

	onSubmitError() {
		if (
			!this.documentation?.custom_id?.trim() ||
			!this.documentation?.regulation?.trim() ||
			!this.documentation?.issue_revision?.trim()
		) {
			return true;
		}

		return false;
	}

	onAdd(e: any, grid: GridComponent) {
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}

		return this._commonService.post(`Documentations`, this.documentation?.toOdata())
	}

	onUpdate(e: any, grid: GridComponent) {
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}

		return this.deleteRelationData().pipe(
			switchMap(() => {
				return this._commonService.put(`Documentations(${this.documentation?.id})`, this.documentation?.toOdata());
			}),
			catchError(err => {
				console.error('Error during delete or update:', err);
				throw err;
			})
		);

	}

	getEnums() {
		this.certificateData = DocumentationCertificateClass.getEnumArray().map((item: any) => {
			return {
				...item,
				certificate: item.value,
			}
		});
		this.cmbDocumentationCertificateData = new ComboFilter(this.certificateData);
		this.markingData = MarkingClass.getEnumArray();
	}

	deleteRelationData() : Observable<any> {
		let requests: ODataBatchCall[] = [];
		let i = 0;
		this.oldData.certificates.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/DocumentationCertificates(${id})`)
			);
			i++;
		});
		return this._commonService.post(`$batch`, { requests });
	}

	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('Documentation').catch(() => false)
		if (value) this.documentation!.custom_id = value;
		this.isLoaderEnabled = false;
	}

	handleFilter(value: String, src: String) {
		switch (src) {
			case "certificate":
				this.certificateData = this.cmbDocumentationCertificateData.handleLocalDataFilter(
					value,
					"text"
				);
				break;
		}
	}
}
