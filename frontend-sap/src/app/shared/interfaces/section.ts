import { SubItem } from "@app/shared/interfaces/sub-item";

export interface Section {
	id: string;
	text: string;
	icon: string;
	subItems: SubItem[];
}