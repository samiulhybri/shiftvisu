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
import { IntlService } from "@progress/kendo-angular-intl";
import { ComboFilter } from "src/app/shared/classes/combo-filter";

@Component({
    selector: "app-type-hours-fixed",
    templateUrl: "./type-hours-fixed.component.html",
    styleUrls: ["./type-hours-fixed.component.scss"],
})
export class TypeHoursFixedComponent implements OnInit, AfterViewInit {
    @Input() data: any;
    @Input() index: any;
    @Input() isFieldDisabled?: boolean;

    @Output() sendUpdatedData = new EventEmitter();

    public form: any;
    public materialCostData: any = [{}];
    public notSelectMachine = true;
    public cmbFltr: any;
    public dataSrcMachine: any = [];

    constructor(public intl: IntlService, private mpOfferSrv: MpOfferService) { }

    ngOnInit() {
        this.form = new FormGroup({
            machine_quantity: new FormControl(),
            machine_price: new FormControl(),
            personnel_quantity: new FormControl(),
            personnel_price: new FormControl(),
            total: new FormControl(),
            mp_machine_id: new FormControl(),
        });

        if (this.isFieldDisabled) this.form.disable();

        if (this.data != undefined) {
            for (var i = 0; i < this.data.mpCost.mpCostMachines.length; i++) {
                this.dataSrcMachine.push(
                    this.data.mpCost.mpCostMachines[i].machine
                );
            }
            if (this.dataSrcMachine.length > 1) {
                this.notSelectMachine = false;
            }

            this.cmbFltr = new ComboFilter(this.dataSrcMachine);
        }

    }

    ngAfterViewInit(): void {
        this.form
            .get("mp_machine_id")
            .valueChanges.subscribe((selectedValue: any) => {
                if (selectedValue != null) {
                    this.data.machine_price = selectedValue.price;
                }
            });

        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }

    handleFilter(value: String) {
        this.dataSrcMachine = this.cmbFltr.handleLocalDataFilter(value, "name");
    }

    isChanged(value: any) {
        return Object.keys(value).every((k) => value[k] == null);
    }
}
