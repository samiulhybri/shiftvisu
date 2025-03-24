import { BaseProperties } from './base-energy-properties.model';
import { EnergyType } from '../enums/energy-type.enum';

/*
    id: a number representing the ID of the energy meter.
    custom_id: a string representing the custom ID of the energy meter.
    ip_address: a string representing the IP address of the energy meter.
    energy_consumer_1_id, energy_consumer_2_id, energy_consumer_3_id, energy_consumer_4_id: foreign IDs referencing the energy consumers associated with the energy meter.
    energy_type_1, energy_type_2, energy_type_3, energy_type_4: values from the EnergyType enum representing the type of energy measured by each input.
    created_at: a Date object representing the timestamp when the energy meter was created.
    updated_at: a Date object representing the timestamp when the energy meter was last updated.
*/

export interface EnergyMeter extends BaseProperties {
	custom_id: string;
	ip_address: string;
	energy_consumer_1_id: number | null;
	energy_type_1: EnergyType;
	energy_consumer_2_id: number | null;
	energy_type_2: EnergyType;
	energy_consumer_3_id: number | null;
	energy_type_3: EnergyType;
	energy_consumer_4_id: number | null;
	energy_type_4: EnergyType;
}
