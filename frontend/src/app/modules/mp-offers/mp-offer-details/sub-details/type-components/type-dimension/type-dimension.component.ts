import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MPOfferPos } from "src/app/models/mp-offer-pos";
import { MPMaterial } from "src/app/models/mp-materials";
import { IntlService } from "@progress/kendo-angular-intl";
import { ComboFilter } from "src/app/shared/classes/combo-filter";
import { MpOfferService } from "@app/modules/mp-offers/services/mp-offer.service";

@Component({
    selector: "app-type-dimension",
    templateUrl: "./type-dimension.component.html",
    styleUrls: ["./type-dimension.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class TypeDimensionComponent implements OnInit, AfterViewInit {
    @Input() data!: MPOfferPos;
    @Input() base_data?: MPMaterial[];
    @Input() index: any;
    @Input() isFieldDisabled?: boolean;

    @Output() sendUpdatedData = new EventEmitter();

    public form: any;
    public cmbFltr: any;
    public materialCostData: any = [{}];
    public density = 0;

    constructor(public intl: IntlService, private mpOfferSrv: MpOfferService) {}

    ngOnChanges(changes: SimpleChanges): void {}

    ngOnInit() {
        this.form = new FormGroup({
            price: new FormControl(),
            length: new FormControl(),
            width: new FormControl(),
            height: new FormControl(),
            total: new FormControl(),
            mp_material_id: new FormControl(),
            density: new FormControl(),
        });
        
        if(this.isFieldDisabled) this.form.disable();
    }
    ngAfterViewInit(): void {
        this.cmbFltr = new ComboFilter(this.base_data?.slice());

        this.form
            .get("mp_material_id")
            .valueChanges.subscribe((selectedValue: any) => {
                if (selectedValue != null) {
                    this.loadMaterialPrice(selectedValue);
                }
            });

        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }

    loadMaterialPrice(mat_id: Number) {
        this.base_data?.forEach((elm: any) => {
            if (elm.id == mat_id) {
                this.data.mpMaterial = elm;
                this.data.price = this.data.mpMaterial?.price;
                this.data.density = this.data.mpMaterial?.density;
            }
        });
    }

    handleFilter(value: String) {
        this.base_data = this.cmbFltr.handleLocalDataFilter(value, "name");
    }
}
