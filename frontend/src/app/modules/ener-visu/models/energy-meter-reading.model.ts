import { BaseProperties } from './base-energy-properties.model';
/*
    id: a primary key column that auto-increments.
    energy_consumer_id: a foreign key column that references the id column of the energy_consumers table.
    value: an integer column that stores the energy reading value.
    energy_type: a string column that stores the energy type
    energy_meter_id: a foreign key column that references the id column of the energy_meters table.
    input_number: an integer column that stores the input number of the energy meter reading.
*/

export interface EnergyMeterReading extends BaseProperties {
	energyConsumerId: number;
	value: number;
	energyType: string;
	energyMeterId: number;
	inputNumber: number;
}
