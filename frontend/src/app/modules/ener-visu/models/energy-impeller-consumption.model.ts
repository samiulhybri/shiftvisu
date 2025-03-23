import { BaseProperties } from './base-energy-properties.model';
import { EnergyType } from './../enums/energy-type.enum';

/*
	id: a number representing the unique identifier of the energy consumption record.
	date: a Date object representing the date of the energy consumption data.
	energy_consumer_id: a number representing the unique identifier of the energy consumer that the data is associated with.
	energy_type: an EnergyType enum value representing the type of energy consumed (e.g. gas, electricity, etc.).
	hour_of_day: a number representing the hour of the day during which the energy was consumed.
	machine_id: a number representing the unique identifier of the machine that consumed the energy.
	alloy_name: a string representing the name of the alloy used in the process.
	material_consumption: a number representing the amount of material consumed in the process.
	energy_consumption: a number representing the amount of energy consumed in the process.
*/

export interface EnergyImpellerConsumption extends BaseProperties {
	date: Date;
	energy_consumer_id: number;
	energy_type: EnergyType;
	hour_of_day: number;
	machine_id: number;
	alloy_name: string;
	material_consumption: number;
	energy_consumption: number;
}
