import { Component, Input, OnInit } from '@angular/core';
import { UsNorm } from '@app/models/us-norm';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { Observable, Subscription } from 'rxjs';
import { CommonService } from '@app/shared/services/common.service';
import { Notification } from '@app/shared/services/notification.service';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { UsNormAdjustment } from '@app/models/us-norm-adjustments';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { UsNormTestScope } from '@app/models/us-norm-test-scope';
import { UsNormRating } from '@app/models/us-norms-rating';
import { UsNormTestSection } from '@app/models/us-norm-test-section';
import { UsNormOperatorClass } from '@app/modules/hwe-qs/enums/UsNormOperator';
import { UsNormSoundAttenuationOperatorClass } from '@app/modules/hwe-qs/enums/UsNormSoundAttenuationOperator';
import { HweUsTestingDeviceClass } from '@app/modules/hwe-qs/enums/HweUsTestingDevice';
import { HweUsShimClass } from '@app/modules/hwe-qs/enums/HweUsShim';
import { HweUsTestSectionClass } from '@app/modules/hwe-qs/enums/HweUsTestSection';
import { UsNormSurfaceFinishClass } from '@app/modules/hwe-qs/enums/UsNormSurfaceFinish';
import { UsNormProbeClass } from '@app/modules/hwe-qs/enums/UsNormProbe';
import { UsNormTestDirectionClass } from '@app/modules/hwe-qs/enums/UsNormTestDirection';
import { UsNormCouplingClass } from '@app/modules/hwe-qs/enums/UsNormCoupling';
import { UsNormAmplificationClass } from '@app/modules/hwe-qs/enums/UsNormAmplification';
import { UsNormAdjustmentClass } from '@app/modules/hwe-qs/enums/UsNormAdjustment';

@Component({
	selector: 'app-us-norms-details',
	templateUrl: './us-norms-details.component.html',
	styleUrls: ['./us-norms-details.component.scss']
})
export class UsNormsDetailsComponent implements OnInit {
	public previousFormData?: UsNorm;
	public gridInstance!: GridComponent;
	public isLoaderEnabled: boolean = false;
	public surfaceFinisData!: Array<{ value: string, text: string }>;
	public couplingData!: Array<{ value: string, text: string }>;
	public amplificationData!: Array<{ value: string, text: string }>;
	public adjustmentData!: UsNormAdjustment[];
	public cmbAdjustmentData!: any;
	public probeData!: Array<{ value: string, text: string }>;
	public cmbProbeData!: any;
	public testDirectionData!: Array<{ value: string, text: string }>;
	public testingDeviceData!: Array<{ value: string, text: string }>;
	public shimData!: Array<{ value: string, text: string }>;
	public testSectionData!: Array<{ value: string, text: string }>;
	public operatorData!: Array<{ value: string, text: string }>;
	public soundAttenuationOperatorData!: Array<{ value: string, text: string }>;
	public addSubscription!: Subscription;
	public usNormTestScopeDeleteIds: number[] = [];
	public usNormRatingDeleteIds: number[] = [];
	public usNormTestSectionDeleteIds: number[] = [];
	public requests: ODataBatchCall[] = []
	public oldData: any = {
		adjustments: [],
	}
	usNorm?: UsNorm;
	@Input() set data(dataItem: UsNorm) {
		this.usNorm = dataItem;
		this.setDocumentation();
	};
	@Input() isAllDisabled: boolean = false;
	constructor(protected _commonService: CommonService,
		protected _notification: Notification
	) {
		this.getEnums()
	}
	setDocumentation() {

		if (this.usNorm == undefined) {
			this.usNorm = new UsNorm();
			this.getNormId()
		} else {
			this.usNorm = new UsNorm().deserialize(this.usNorm);
			this.previousFormData = JSON.parse(JSON.stringify(this.usNorm));
			this.oldData.adjustments = this.usNorm?.adjustments?.map((value: any) => value.id) ?? []

		}
	}

	ngOnInit() {
		if (!this.usNorm) this.setDocumentation();
	}


	onAdd(event: PointerEvent, grid: GridComponent) {
		if (!this.usNorm?.custom_id?.trim() || !this.usNorm.coupling || !this.usNorm.amplification) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}

		return this._commonService.post(`UsNorms`, this.usNorm?.toOdata())

	}
	onUpdate(event: PointerEvent, grid: GridComponent) {
		if (!this.usNorm?.custom_id?.trim() || !this.usNorm.coupling || !this.usNorm.amplification) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}
		this.requests = [];
		let incrementIndex: number = 1;
		this.prepairUsNormData(incrementIndex)
		this.prepairUsNormTestScopes(incrementIndex)
		this.prepairUsTestSections(incrementIndex)
		this.prepairUsNormRatings(incrementIndex)

		this.deleteRelationData()
		return this._commonService.post(`$batch`, { requests: this.requests })
	}
	prepairUsNormData(incrementIndex: number) {
		let usNorm = new ODataBatchCall(
			incrementIndex,
			"put",
			`\/odata\/UsNorms(${this.usNorm?.id})`
		)

		usNorm.body = this.usNorm?.toOdata(true);

		this.requests.push(usNorm);
		incrementIndex += 1
	}
	prepairUsNormTestScopes(incrementIndex: number) {
		this.usNormTestScopeDeleteIds.map((id: number) => {
			incrementIndex += 1
			this.requests.push(new ODataBatchCall(
				incrementIndex,
				"delete",
				`\/odata\/UsNormTestScopes(${id})`
			))
		})
		this.usNorm?.usNormTestScopes?.map((usNormTestScope: UsNormTestScope) => {
			let usNorm = new ODataBatchCall(
				incrementIndex,
				usNormTestScope.id ? "patch" : "post",
				usNormTestScope.id ? `\/odata\/UsNormTestScopes(${usNormTestScope?.id})` : `\/odata\/UsNormTestScopes`

			)
			usNormTestScope.usNorm = this.usNorm
			usNormTestScope = new UsNormTestScope().deserialize(usNormTestScope);
			usNorm.body = usNormTestScope?.toOdata();
			this.requests.push(usNorm);
			incrementIndex += 1
		})
	}
	prepairUsTestSections(incrementIndex: number) {

		this.usNormTestSectionDeleteIds.map((id: number) => {
			incrementIndex += 1
			this.requests.push(new ODataBatchCall(
				incrementIndex,
				"delete",
				`\/odata\/UsNormTestSections(${id})`
			))
		})
		this.usNorm?.usNormTestSections?.map((usNormTestSection: UsNormTestSection) => {
			let usNormSec = new ODataBatchCall(
				incrementIndex,
				usNormTestSection.id ? "patch" : "post",
				usNormTestSection.id ? `\/odata\/UsNormTestSections(${usNormTestSection?.id})` : `\/odata\/UsNormTestSections`

			)
			usNormTestSection.usNorm = this.usNorm;
			usNormTestSection = new UsNormTestSection().deserialize(usNormTestSection)
			usNormSec.body = usNormTestSection?.toOdata();

			this.requests.push(usNormSec);
			incrementIndex += 1
		})

	}
	prepairUsNormRatings(incrementIndex: number) {
		this.usNormRatingDeleteIds.map((id: number) => {
			incrementIndex += 1
			this.requests.push(new ODataBatchCall(
				incrementIndex,
				"delete",
				`\/odata\/UsNormRatings(${id})`
			))
		})
		this.usNorm?.usNormRatings?.map((usNormRating: UsNormRating) => {
			let usNorm = new ODataBatchCall(
				incrementIndex,
				usNormRating.id ? "patch" : "post",
				usNormRating.id ? `\/odata\/UsNormRatings(${usNormRating?.id})` : `\/odata\/UsNormRatings`

			)

			usNormRating.usNorm = this.usNorm;
			usNormRating = new UsNormRating().deserialize(usNormRating)
			usNorm.body = usNormRating?.toOdata();

			this.requests.push(usNorm);
			incrementIndex += 1
		})
	}

	getEnums() {
		this.surfaceFinisData = UsNormSurfaceFinishClass.getEnumArray();
		this.couplingData = UsNormCouplingClass.getEnumArray();
		this.amplificationData = UsNormAmplificationClass.getEnumArray();
		this.probeData = UsNormProbeClass.getEnumArray()
		this.cmbProbeData = new ComboFilter(this.probeData)
		this.adjustmentData = UsNormAdjustmentClass.getEnumArray().map((item: any) => {
			return {
				...item,
				adjustment: item.value,
			}
		})
		this.cmbAdjustmentData = new ComboFilter(this.adjustmentData);
		this.testDirectionData = UsNormTestDirectionClass.getEnumArray()
		this.testingDeviceData = HweUsTestingDeviceClass.getEnumArray();
		this.shimData = HweUsShimClass.getEnumArray();
		this.testSectionData = HweUsTestSectionClass.getEnumArray();
		this.operatorData = UsNormOperatorClass.getEnumArray();
		this.soundAttenuationOperatorData = UsNormSoundAttenuationOperatorClass.getEnumArray();
	}

	deleteRelationData() {
		let requests: ODataBatchCall[] = [];
		let i = 0;
		this.oldData.adjustments.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/UsNormAdjustments(${id})`)
			);
			i++;
		});
		this._commonService.post(`$batch`, { requests }).subscribe({
			next: (res) => {

			},
		})
	}

	async getNormId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('UsNorm')
			.catch(() => false)

		if (value) {
			this.usNorm!.custom_id = value
		}
		this.previousFormData = JSON.parse(JSON.stringify(this.usNorm));
		this.isLoaderEnabled = false;
	}

	handleFilter(value: String, src: String) {
		switch (src) {
			case "probe":
				this.probeData = this.cmbProbeData.handleLocalDataFilter(
					value,
					"text"
				);
				break;

		}
	}

	addTestScope() {
		this.usNorm?.usNormTestScopes?.push(new UsNormTestScope())
	}
	addRatings() {
		const newUsRating = new UsNormRating();
		let rating = 1;
		console.log(this.usNorm, newUsRating)
		if (this.usNorm?.usNormRatings?.length) {
			const lastRating = this.usNorm.usNormRatings[this.usNorm.usNormRatings.length - 1].rating;
			rating = lastRating && !isNaN(+lastRating) ? +lastRating + rating : 0;
		}

		newUsRating.rating = rating.toString();
		this.usNorm?.usNormRatings?.push(newUsRating);
	}
	addSection() {
		this.usNorm?.usNormTestSections?.push(new UsNormTestSection())
	}
	removeTestScope(scope: UsNormTestSection, index: number) {
		this._notification.deleteItem().subscribe((result: any) => {
			if (result.action == 'next') {
				if (scope.id) this.usNormTestScopeDeleteIds.push(scope.id)
				this.usNorm?.usNormTestScopes?.splice(index, 1)
			}
		});
	}
	removeRatings(rating: UsNormTestSection, index: number) {
		this._notification.deleteItem().subscribe((result: any) => {
			if (result.action == 'next') {
				if (rating.id) this.usNormRatingDeleteIds.push(rating.id)
				this.usNorm?.usNormRatings?.splice(index, 1)
			}
		});

	}
	removeSection(section: UsNormTestSection, index: number) {
		this._notification.deleteItem().subscribe((result: any) => {
			if (result.action == 'next') {
				if (section.id) this.usNormTestSectionDeleteIds.push(section.id)
				this.usNorm?.usNormTestSections?.splice(index, 1)
			}
		});

	}
}
