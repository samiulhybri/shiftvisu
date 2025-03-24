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
	selector: 'app-type-mouldflow',
	templateUrl: './type-mouldflow.component.html',
	styleUrls: ['./type-mouldflow.component.scss']
})
export class TypeMouldflowComponent implements OnInit {
	@Input() data: any;
	@Input() suppliers!: Supplier[];
	@Input() isFieldDisabled?: boolean;

	public form: any;
	public cmbFltr: any;
	public materialCostData: any = [{}];

	constructor(private mpOfferSrv: MpOfferService) {}

	ngOnInit() {
		this.form = new FormGroup({
			mouldflow_type: new FormControl(),
			total: new FormControl(),
		});
		
        if(this.isFieldDisabled) this.form.disable();
		
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
}
