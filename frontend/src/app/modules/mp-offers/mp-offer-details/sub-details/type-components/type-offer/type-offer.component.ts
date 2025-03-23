import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewEncapsulation,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MpOfferService } from "@app/modules/mp-offers/services/mp-offer.service";
import { Supplier } from "src/app/models/supplier";
import { ComboFilter } from "src/app/shared/classes/combo-filter";

@Component({
	selector: "app-type-offer",
	templateUrl: "./type-offer.component.html",
	styleUrls: ["./type-offer.component.scss"],
	encapsulation: ViewEncapsulation.None,
})
export class TypeOfferComponent implements OnInit {
	@Input() index: any;
	@Input() data: any;
	@Input() suppliers!: Supplier[];
	@Input() isFieldDisabled?: boolean;

	@Output() sendUpdatedData = new EventEmitter();

	public cmbFltr: any;
	public form: any;
	public materialCostData: any = [{}];

	constructor(private mpOfferSrv: MpOfferService) {}

	ngOnInit() {
		this.form = new FormGroup({
			supplier: new FormControl(),
			supplier_offer_date: new FormControl(),
			supplier_offer_id: new FormControl(),
			total: new FormControl(),
		});

        if(this.isFieldDisabled) this.form.disable();

		if (this.data.supplier_offer_date != undefined) {
			this.data.supplier_offer_date = new Date(this.data.supplier_offer_date);
		}
		if (this.data != undefined) {
			this.cmbFltr = new ComboFilter(this.suppliers?.slice());
		}
	}

	ngAfterViewInit(): void {
        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }

	handleFilter(value: String) {
		this.suppliers = this.cmbFltr.handleLocalDataFilter(value, "name");
	}

	eventCallBack() {
		this.sendUpdatedData.emit(this.data);
	}
}
