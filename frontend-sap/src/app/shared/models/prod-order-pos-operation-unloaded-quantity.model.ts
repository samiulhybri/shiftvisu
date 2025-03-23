import { Deserializable } from "@app/shared/interfaces/deserializable";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { formatDate } from "@app/shared/utils/date-time-formatter";

export class ProdOrderPosOperationUnloadedQuantity implements Deserializable {
    id?: number;
    machine_id?: number;
    prodOrderPosOperation?: ProdOrderPosOperation
    prod_order_pos_operation_id?: number;
    prod_order_pos_operation_loaded_quantity_id?: number;
    quantity: number = 0;
    date?: Date;
    user_id?: number;
    created_at?: Date;
    updated_at?: Date;
    dateTime: string = ''; // internal use only

    constructor() {}

    deserialize(input: any): this {
        Object.assign(this, input);
        this.quantity = input.quantity ? +input.quantity : 0;

        if(input.prod_order_pos_operation) {
            this.prodOrderPosOperation = new ProdOrderPosOperation().deserialize(input.prod_order_pos_operation)
        }
        this.dateTime = input.date ? formatDate(input.date) : '';
        return this;
	}
}