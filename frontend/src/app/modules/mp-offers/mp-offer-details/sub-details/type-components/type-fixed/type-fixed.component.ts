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
	selector: "app-type-fixed",
	templateUrl: "./type-fixed.component.html",
	styleUrls: ["./type-fixed.component.scss"],
	encapsulation: ViewEncapsulation.None,
})
export class TypeFixedComponent implements OnInit {
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
			name: new FormControl(),
		});
		
        if(this.isFieldDisabled) this.form.disable();
	}

	ngAfterViewInit(): void {
        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }
}
