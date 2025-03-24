import { BaseProperties } from './base-energy-properties.model';
import { EnergyType } from '../enums/energy-type.enum';

/*
    id: primary key of the table.
    date: date when the energy consumption was recorded.
    energy_consumer_id: foreign key referencing the id column of the energy_consumers table.
    energy_type: type of energy consumed (enum value).
    hour_of_day: hour of the day when the energy consumption was recorded.
    energy_consumption: amount of energy consumed.
    created_at: timestamp of when the record was created.
    updated_at: timestamp of when the record was last updated.
*/

export interface EnergyConsumption extends BaseProperties {
	date: string;
	energy_consumer_id: number;
	energy_type: EnergyType;
	hour_of_day: number;
	energy_consumption: number;
}
