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
import { MpPfPmType, MpPfPmTypeClass } from "src/app/enums/mp-pf-pm-type";
import { ComboFilter } from "src/app/shared/classes/combo-filter";

@Component({
	selector: 'app-type-pf-pm',
	templateUrl: './type-pf-pm.component.html',
	styleUrls: ['./type-pf-pm.component.scss']
})
export class TypePfPmComponent implements OnInit {
	@Input() data: any;
	@Input() isFieldDisabled?: boolean;

	public form: any;
	public cmbFltr: any;
	public materialCostData: any = [{}];
	public PfPmDataSrc !: Array<{ value: string, text: string }>;

	constructor(private mpOfferSrv: MpOfferService) {}

	ngOnInit() {
		this.form = new FormGroup({
			pf_pm_type: new FormControl(),
			total: new FormControl(),
		});
		this.PfPmDataSrc = new MpPfPmTypeClass().getEnumArray();
		this.cmbFltr = new ComboFilter(this.PfPmDataSrc.slice());

        if(this.isFieldDisabled) this.form.disable();
	}

	ngAfterViewInit(): void {
        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }

	handleFilter(value: String) {
		this.PfPmDataSrc = this.cmbFltr.handleLocalDataFilter(value, "text");
	}
}
