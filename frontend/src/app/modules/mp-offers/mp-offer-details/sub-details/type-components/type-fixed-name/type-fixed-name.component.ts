import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	AfterViewInit,
	ViewEncapsulation,
} from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { MpOfferService } from "@app/modules/mp-offers/services/mp-offer.service";

@Component({
	selector: 'app-type-fixed-name',
	templateUrl: './type-fixed-name.component.html',
	styleUrls: ['./type-fixed-name.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class TypeFixedNameComponent implements OnInit {
	@Input() index: any;
	@Input() data: any;
	@Input() isFieldDisabled?: boolean;

	@Output() sendUpdatedData = new EventEmitter();

	public form: any;
	public materialCostData: any = [{}];

	constructor(private mpOfferSrv: MpOfferService) {}

	ngOnInit() {
		this.form = new FormGroup({
			total: new FormControl(),
		});
		
        if(this.isFieldDisabled) this.form.disable();
	}

	ngAfterViewInit(): void {
        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }
}