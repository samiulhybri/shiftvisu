import { Chat } from "@app/shared/models/chat.model";
import { Plant } from "@app/shared/models/plant.model";
import { Suppliers } from "@app/shared/models/suppliers.model";
import { User } from "@app/shared/models/user.model";

export interface EightDReport {
    id?: number,
    title: string,
    complaint_no?: string,
    description?: string,
    supplier?: Suppliers,
    supplier_id?: number | null;
    complaint_opening_date?:  string | null,
    revision?: number,
    revision_date?: Date | string | null,
    production_site?: string,
    part_name?: string,
    drawing_no?: number,
    drawing_revision?: string,
    quantity_delivered?: number,
    quantity_claimed?: number,
    plant?: Plant,
    plant_id?: number | null,
    team?: User[],
    author_accepted?: boolean,
    author?: User,
    author_id?: number,
    author_closing_date?: Date | string | null,
    client_accepted?: boolean,
    client_name?: string,
    client_closing_date?: Date | string | null,
    chat?: Chat,
    chat_id?: number
}
