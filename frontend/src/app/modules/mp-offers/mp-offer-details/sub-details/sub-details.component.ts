import {
	AfterContentInit,
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewEncapsulation,
} from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { IntlService } from "@progress/kendo-angular-intl";
import { MPMaterial } from "src/app/models/mp-materials";
import { MPOffer } from "src/app/models/mp-offer";
import { MPOfferPos } from "src/app/models/mp-offer-pos";
import { Supplier } from "src/app/models/supplier";

@Component({
	selector: "app-sub-details",
	templateUrl: "./sub-details.component.html",
	styleUrls: ["./sub-details.component.scss"],
	encapsulation: ViewEncapsulation.None,
})
export class SubDetailsComponent implements OnInit, AfterContentInit {
	@Input() data?: MPOfferPos[];
	@Input() base_data?: MPMaterial[];
	@Input() cost_sub_group: any;
	@Input() offer?: MPOffer;
	@Input() suppliers?: Supplier[];
	@Output() sendFormData = new EventEmitter();

	public form: any;
	public materialCostData: any = [{}];
	public total = 0;
	changedData: any = {};

	constructor(public intl: IntlService) { }

	ngOnInit(): void {
		this.form = new FormGroup({
			total: new FormControl(),
		});

		if(this.offer?.is_closed) this.form.disable();
	}

	ngAfterContentInit(): void {
		if (this.data != undefined) {
			this.calculateTotal();
		}
	}

	calculateTotal() {
		this.total = 0;
		this.data?.forEach((element: MPOfferPos) => this.total += element.getTotal());
	}
}
