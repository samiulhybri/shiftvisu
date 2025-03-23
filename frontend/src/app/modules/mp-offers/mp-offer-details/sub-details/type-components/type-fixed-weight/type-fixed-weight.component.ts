import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewEncapsulation,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MpOfferService } from "@app/modules/mp-offers/services/mp-offer.service";
import { IntlService } from "@progress/kendo-angular-intl";

@Component({
	selector: 'app-type-fixed-weight',
	templateUrl: './type-fixed-weight.component.html',
	styleUrls: ['./type-fixed-weight.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class TypeFixedWeightComponent implements OnInit {
	@Input() data: any;
	@Input() index: any;
	@Input() isFieldDisabled?: boolean;

	@Output() sendUpdatedData = new EventEmitter();

	public form: any;
	public materialCostData: any = [{}];

	constructor(public intl: IntlService, private mpOfferSrv: MpOfferService) { }

	ngOnInit() {
		this.form = new FormGroup({
			quantity: new FormControl(),
			price: new FormControl(),
			total: new FormControl(),
		});

		if (this.isFieldDisabled) this.form.disable();
	}

	ngAfterViewInit(): void {
        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }
}