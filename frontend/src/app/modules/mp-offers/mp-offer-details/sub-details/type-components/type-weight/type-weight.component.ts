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
import { Supplier } from "src/app/models/supplier";
import { ComboFilter } from "src/app/shared/classes/combo-filter";

@Component({
    selector: "app-type-weight",
    templateUrl: "./type-weight.component.html",
    styleUrls: ["./type-weight.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class TypeWeightComponent implements OnInit {
    @Input() data: any;
    @Input() index: any;
    @Input() suppliers!: Supplier[];
    @Input() isFieldDisabled?: boolean;

    @Output() sendUpdatedData = new EventEmitter();

    public form: any;
    public cmbFltr: any;
    public materialCostData: any = [{}];

    constructor(public intl: IntlService, private mpOfferSrv: MpOfferService) {}

    ngOnInit() {
        this.form = new FormGroup({
            quantity: new FormControl(),
            supplier: new FormControl(),
            price: new FormControl(),
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
