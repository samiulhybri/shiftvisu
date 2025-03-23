import { BaseProperties } from './base-energy-properties.model';

/*
    id: primary key of the table.
    custom_id: unique identifier for each energy consumer.
    name: name of the energy consumer.
    machine_id: foreign key referencing the id column of the machines table.
    created_at: timestamp of when the record was created.
    updated_at: timestamp of when the record was last updated.
*/

export interface EnergyConsumer extends BaseProperties {
	custom_id: string;
	name: string;
	machine_id: number;
}

