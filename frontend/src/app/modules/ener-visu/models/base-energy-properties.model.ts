/*
	other interfaces can extend it to inherit these common properties, rather than having to redefine them for every interface
*/

export interface BaseProperties {
	id: number;
	created_at: string | Date;
	updated_at: string | Date;
}
