import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { IntlService } from '@progress/kendo-angular-intl';
import { orderBy } from '@progress/kendo-data-query';
import { AxisLabelContentArgs, Legend, SeriesLabelsContentArgs } from '@progress/kendo-angular-charts';
import { addDays } from '@progress/kendo-date-math';
import { GridProperty } from '@app/shared/classes/grid-property';
import * as moment from 'moment';
// Services
import { CommonService } from '@app/shared/services/common.service';

// Enums
import { BarType } from '@app/shared/components/kendo/bar-chart/enums/bar-type.enum';
import { EnergyTypeClass, EnergyType } from '@app/enums/energy-type.enum';
import { DurationTypeClass, DurationType } from '@app/enums/duration-type.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-material-consumption',
	templateUrl: './material-consumption.component.html',
	styleUrls: ['./material-consumption.component.scss']
})
export class MaterialConsumptionComponent extends GridProperty {
	public durationList: Array<any> = [];
	public selectedPeriods: Array<any> = [];
	public selectedFurnaces: Array<any> = [];
	public selectedAlloyOnTable: Array<any> = [];
	public furnaces: Array<any> = [];
	private furnaceIds: Array<number> = [];
	public energyConsumerMachines: Array<any> = [];
	public energyConsumptions: Array<any> = [];
	public materialConsumptions: Array<any> = [];
	public isLoading: boolean = false;
	public gridConsumptionTotal: number = 0;
	public currentTime: Date = new Date();
	public popupButtonText = $localize`Filter`;
	public consumerMachineIds: string = '';

	public selectedValue: any = {
		type: EnergyType.ELECTRICITY,
		startDate: addDays(this.currentTime, -13),
		endDate: this.currentTime,
		duration: DurationType.DAY
	};

	public listItems: Array<{ text: string; value: string }> = EnergyTypeClass.getEnergyType();
	public durationItems: Array<{ text: string; value: string }> = DurationTypeClass.getDurationType();

	public legend: Legend = {
		visible: false
	};

	get currentBarValue(): BarType {
		return BarType.COLUMN;
	}

	public periodSeriesData: Array<any> = [
		{
			data: []
		}
	];
	public periodMaxValue = undefined;

	public furnaceCategories: Array<any> = [];
	public furnaceSeriesData: Array<any> = [
		{
			data: []
		}
	];
	public furnaceMaxValue = undefined;

	public seriesBorderOption = {
		width: 0
	}

	public majorGridLines = {
		visible: true
	};

	public seriesGap = .3;

	public seriesLabelContent = (e: SeriesLabelsContentArgs): string => {
		return e.value.toLocaleString();
	};

	public valueAxisLabelContent = (e: AxisLabelContentArgs): string => {
		return e.value.toLocaleString();
	};

	public categoryAxisLabelContent = (e: AxisLabelContentArgs): string => {
		let valueArray = e.value.match(/.{1,15}/g);
		if (valueArray!.length == 1) return valueArray![0];
		if (valueArray!.length == 2) return valueArray![0] + "\n" + valueArray![1];
		if (valueArray!.length > 2) return valueArray![0] + "\n" + valueArray![1].slice(0, -1) + "...";
		return "";
	};

	public editView = {
		isHiddenActionColumn: true,
		isSelection: true
	};

	public refreshReport(type: any) {
		if (type == 'all') {
			this.selectedFurnaces = [];
			this.selectedPeriods = [];
			this.selectedAlloyOnTable = [];
		}
		this.prepareData();
	}

	public consumerGridColumns = this.getConsumerGridColumns();
	public selectedHalle: string = '';
	public selectedConsumerGroup: string = '';

	constructor(
		private route: ActivatedRoute,
		_commonService: CommonService,
		public intl: IntlService
	) {
		super(_commonService);
	}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			this.selectedHalle = params['halle'];
			this.selectedConsumerGroup = params['consumer_group'];
		});

		this.getData();
	}

	private getData() {
		var machURL = `Machines?$filter=is_furnace eq 1`;
		let consumerURL = `EnergyConsumerMachines?$select=id,machine_id,energy_consumer_id`;
		let consumerIds: string = '';

		this.getFurnaces(machURL);

		if(this.selectedConsumerGroup && this.selectedConsumerGroup != '') {
			let url = `EnergyConsumers?$select=id&filter=energy_consumer_group_id eq ${ this.selectedConsumerGroup }`;
			this.isLoading = true;
			this._commonService.get(url).subscribe({
				next: (response: any) => {
					this.isLoading = true;
					if(response.value && response.value.length > 0) {
						consumerIds = response.value.map((obj: any) => obj.id).join(',');
						consumerURL = `EnergyConsumerMachines?$select=id,machine_id,energy_consumer_id&filter=energy_consumer_id in (${ consumerIds })`;
					}
					this.getEnergyConsumerMachines(consumerURL);
				}
			})
		} else {
			this.getEnergyConsumerMachines(consumerURL);
		}
	}

	public getEnergyConsumerMachines(url: string) {
		this.isLoading = true;
		this._commonService.get(url).subscribe({
			next: (response: any) => {
				this.energyConsumerMachines = response.value;
				this.consumerMachineIds = response.value.map((obj: any) => obj.machine_id).join(',');
				// var machURL = `Machines?$filter=is_furnace eq 1`;
				// if(this.selectedConsumerGroup && this.selectedConsumerGroup != '') machURL = `Machines?$filter=is_furnace eq 1 and id in (${ this.consumerMachineIds })`;
				// this.getFurnaces(machURL);
			}
		})
	}

	private getFurnaces(url: string) {
		this.isLoading = true;
		this.furnaceIds = [];
		this._commonService.get(url).subscribe({
			next: (response: any) => {
				this.isLoading = false;
				this.furnaces = response.value
				this.furnaces.map(furnace => {
					this.furnaceCategories.push(furnace.name)
					this.furnaceIds.push(furnace.id)
				})
			}
		})
	}

	public loadData(event: any) {
		this.selectedValue = event.selectedValue;
		this.durationList = event.durationList;
		this.getConsumptions(this.selectedValue.startDate, this.selectedValue.endDate);
	}

	private formatNumber(value: number): string {
		return value < 10 ? `0${value}` : `${value}`;
	}

	private getWeekNumber(date: Date): number {
		const onejan = new Date(date.getFullYear(), 0, 1);
		return Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
	}

	private getUTCDateTime(dateTime: Date) {
		return new Date(
			dateTime.getUTCFullYear(),
			dateTime.getUTCMonth(),
			dateTime.getUTCDate(),
			dateTime.getUTCHours(),
			dateTime.getUTCMinutes(),
			dateTime.getUTCSeconds(),
			dateTime.getUTCMilliseconds()
		)
	}

	public getConsumptions(start: Date, end: Date) {
		this.isLoading = true;
		const startDate = this.intl.formatDate(this.getUTCDateTime(start), "yyyy-MM-dd HH:mm:ss");
		const endDate = this.intl.formatDate(this.getUTCDateTime(end), "yyyy-MM-dd HH:mm:ss");

		let energyURL = `EnergyConsumptions?filter=consumption_hour ge '${startDate}' and consumption_hour le '${endDate}' and energy_type eq '${this.selectedValue.type}'&$top=10000000`;
		let materialURL = `MaterialConsumptions?$expand=user(select=name,id),item(select=name,id),furnace(select=name,id),machines(select=name,id)&$filter=created_at ge '${startDate}' and created_at le '${endDate}'&$top=10000000`;
		if(this.consumerMachineIds && this.consumerMachineIds != '') 
			materialURL = `MaterialConsumptions?$expand=user(select=name,id),item(select=name,id),furnace(select=name,id),machines(select=name,id)&$filter=created_at ge '${startDate}' and created_at le '${endDate}' and furnace_id in (${ this.consumerMachineIds })&$top=10000000`;

		forkJoin([
			this._commonService.get(energyURL),
			this._commonService.get(materialURL)
		]).subscribe(([energyConsumptions, materialConsumptions]: any) => {
			this.isLoading = false;
			let energyConsumptionsList: Array<any> = [];
			energyConsumptions.value.map((item: any) => {
				const machineId = this.getMachineId(item.energy_consumer_id);
				if (machineId) {
					const machineInfo: any = this.getMachineInfo(machineId);
					energyConsumptionsList.push({
						...item,
						period: this.getPeriod(item.consumption_hour),
						machine_id: machineId,
						machine_name: machineInfo.name
					})
				}
			})

			this.energyConsumptions = energyConsumptionsList;

			let materialConsumptionsList: Array<any> = [];
			materialConsumptions.value.map((item: any) => {
				materialConsumptionsList.push({
					machine_id: item.furnace ? item.furnace.id: null,
					machine_name: item.furnace ? item.furnace.name : '',
					alloy_id: item.item ? item.item.id : null,
					alloy_name: item.item ? item.item.name : '',
					quantity: item.quantity,
					period: this.getPeriod(item.created_at),
					key: item.item && item.furnace ? item.item.id + '_' + item.furnace.id : '',
					created_at: item.created_at
				})
			})

			this.materialConsumptions = materialConsumptionsList;
			this.refreshReport('all')
		});
	}

	private getMachineId(id: number): number {
		for (let i = 0; i < this.energyConsumerMachines.length; i++) {
			const element = this.energyConsumerMachines[i];
			if (element.energy_consumer_id == id) {
				if (this.furnaceIds.includes(element.machine_id)) return element.machine_id;
			}
		}
		return 0
	}

	private getMachineInfo(id: number): Object {
		const machine = this.furnaces.find(machine => machine.id == id);
		return machine;
	}

	public prepareData() {
		let energyConsumptions = [...this.energyConsumptions];
		let materialConsumptions = [...this.materialConsumptions];
		energyConsumptions = energyConsumptions.filter(this.useConditions(this.getFiltersKeyValue()))
		materialConsumptions = materialConsumptions.filter(this.useConditions(this.getFiltersKeyValue('furnace')))
		if (!this.selectedAlloyOnTable.length) this.distributeReport(energyConsumptions, materialConsumptions, 'furnaceTable');
		this.distributeReport(energyConsumptions, materialConsumptions, 'furnaceChart')
		this.distributeReport(energyConsumptions, materialConsumptions, 'periodChart')
	}

	public distributeReport(energyConsumptions: Array<any>, materialConsumptions: Array<any>, type: string) {
		switch (type) {
			case 'furnaceTable':
				let alloyResult = this.formatData(energyConsumptions, materialConsumptions)
				this.gridItems = {
					total: alloyResult.length,
					data: alloyResult
				}
				this.isLoadedEnabled = false
				break;
			case 'periodChart':
				this.preparePeriodChart(energyConsumptions, materialConsumptions);
				break;
			case 'furnaceChart':
				this.prepareFurnaceChart(energyConsumptions, materialConsumptions);
				break;
			default:
				break;
		}
	}

	public preparePeriodChart(energyConsumptions: Array<any>, materialConsumptions: Array<any>) {
		if (this.selectedPeriods.length) {
			this.periodSeriesData[0].data = this.periodSeriesData[0].data.map((item: any) => {
				return {
					...item,
					color: this.selectedPeriods.includes(item.category) ? '#005981' : '#A6C5D3'
				}
			})
		} else {
			let consumptionValues = [];
			for (let i = 0; i < this.durationList.length; i++) {
				let eneryConsumption = 0;
				energyConsumptions.map(item => {
					if (item.period == this.durationList[i]) eneryConsumption += item.energy_consumption
				})

				let materialConsumption = 0;
				materialConsumptions.map(item => {
					if (item.period == this.durationList[i]) materialConsumption += item.quantity;
				})

				let kpi = eneryConsumption / materialConsumption;
				consumptionValues.push({
					value: (eneryConsumption == 0 || materialConsumption == 0) ? 0 : parseFloat(kpi.toFixed(2)),
					category: this.durationList[i],
					color: '#005981'
				})
			}
			this.periodSeriesData[0].data = consumptionValues

			let maxValue: any = Math.max.apply(Math, this.periodSeriesData[0].data.map((o: any) => { return o.value; }))
			if (maxValue == 0) {
				this.periodMaxValue = undefined;
			} else {
				this.periodMaxValue = maxValue + (maxValue / 2);
			}
		}
	}

	public prepareFurnaceChart(energyConsumptions: Array<any>, materialConsumptions: Array<any>) {
		if (this.selectedFurnaces.length) {
			this.furnaceSeriesData[0].data = this.furnaceSeriesData[0].data.map((item: any) => {
				return {
					...item,
					color: this.selectedFurnaces.includes(item.category) ? '#005981' : '#A6C5D3'
				}
			})
		} else {
			let consumptionValues = []
			for (let i = 0; i < this.furnaceCategories.length; i++) {
				let consumption = 0;
				energyConsumptions.map(item => {
					if (item.machine_name == this.furnaceCategories[i]) consumption += item.energy_consumption
				})
				consumptionValues.push({
					value: consumption,
					category: this.furnaceCategories[i],
					color: '#005981'
				})
			}

			this.furnaceSeriesData[0].data = orderBy(consumptionValues, [{ field: 'value', dir: 'desc' }]);
			let furnaceCategories: Array<any> = [];
			this.furnaceSeriesData[0].data.map((item: any) => {
				furnaceCategories.push(item.category)
			})
			this.furnaceCategories = furnaceCategories

			if (!this.furnaceSeriesData[0].data[0] || this.furnaceSeriesData[0].data[0].value == 0) {
				this.furnaceMaxValue = undefined;
			} else {
				this.furnaceMaxValue = this.furnaceSeriesData[0].data[0].value + (this.furnaceSeriesData[0].data[0].value / 2);
			}
		}
	}

	public periodSeriesEvent(event: any) {
		if (event.originalEvent.event.ctrlKey) {
			let selectedIndex = this.selectedPeriods.indexOf(event.category)
			if (this.selectedPeriods.includes(event.category)) {
				if (this.selectedPeriods.length == 1) return
				this.selectedPeriods.splice(selectedIndex, 1)
			} else {
				this.selectedPeriods = [...this.selectedPeriods, event.category]
			}
		} else {
			if (this.selectedPeriods.includes(event.category)) return
			this.selectedPeriods = [event.category]
		}

		this.prepareData()
	}

	public furnaceSeriesEvent(event: any) {
		if (event.originalEvent.event.ctrlKey) {
			let selectedIndex = this.selectedFurnaces.indexOf(event.category)
			if (this.selectedFurnaces.includes(event.category)) {
				if (this.selectedFurnaces.length == 1) return
				this.selectedFurnaces.splice(selectedIndex, 1)
			} else {
				this.selectedFurnaces = [...this.selectedFurnaces, event.category]
			}
		} else {
			if (this.selectedFurnaces.includes(event.category)) return
			this.selectedFurnaces = [event.category]
		}

		this.prepareData()
	}

	public consumerGridRowSelect(event: any) {
		const selectedItems = [...this.selectedAlloyOnTable];
		if (event.selectedRows.length) {
			event.selectedRows.map(({ dataItem }: any) => {
				selectedItems.push(dataItem.key)
			})
		}
		if (event.deselectedRows.length) {
			event.deselectedRows.map(({ dataItem }: any) => {
				let selectedIndex = selectedItems.indexOf(dataItem.key)
				if (selectedIndex != -1) selectedItems.splice(selectedIndex, 1)
			})
		}
		this.selectedAlloyOnTable = selectedItems;
		this.prepareData()
	}

	private useConditions(search: any = {}): any {
		return (a: any): boolean => {
			return Object.keys(search).every(k =>
				a[k] === search[k] ||
				Array.isArray(search[k]) && search[k].includes(a[k]) ||
				typeof search[k] === 'object' && +search[k].min <= a[k] && a[k] <= +search[k].max ||
				typeof search[k] === 'function' && search[k](a[k])
			);
		};
	}

	private getPeriod(date: any): any {
		if (this.selectedValue.duration == DurationType.HOUR) {
			return this.intl.formatDate(new Date(date), 'HH-dd.MM.yyyy');
		}
		if (this.selectedValue.duration == DurationType.DAY) {
			return this.intl.formatDate(new Date(date), 'dd.MM.yyyy')
		}
		if (this.selectedValue.duration == DurationType.WEEK) {
			return moment(date).startOf('isoWeek').isoWeekday(1).format('ww-yyyy');
		}
		if (this.selectedValue.duration == DurationType.MONTH) {
			return this.intl.formatDate(new Date(date), 'MM-yyyy');
		}
		if (this.selectedValue.duration == DurationType.YEAR) {
			return this.intl.formatDate(new Date(date), 'yyyy');
		}
	}

	private getFiltersKeyValue = (type: any = undefined) => {
		let filters: any = {};
		if (this.selectedPeriods.length) filters.period = this.selectedPeriods
		if (this.selectedFurnaces.length || this.selectedAlloyOnTable.length) filters.machine_name = this.getFilterMachineNames(this.selectedFurnaces, this.selectedAlloyOnTable)
		if (this.selectedAlloyOnTable.length && type == 'furnace') filters.key = this.selectedAlloyOnTable
		return filters
	}

	private getFilterMachineNames(furnaces: Array<any>, alloyFurnaces: Array<any>) {
		const furnaceList = [...furnaces];
		alloyFurnaces.map(item => {
			const machineId = item.split('_')[1];
			const machineInfo: any = this.getMachineInfo(machineId);
			if (machineInfo) {
				if (!furnaceList.includes(machineInfo.name)) {
					furnaceList.push(machineInfo.name)
				}
			}
		})
		return furnaceList
	}

	private formatData = (energyConsumptions: any, materialConsumptions: any) => {
		let formattedData: any = [];
		let map: any = [];
		materialConsumptions.forEach((item: any) => {
			const key = item['alloy_id'] + '_' + item['machine_id'];
			const qty_gas = this.getEnergyValue(energyConsumptions, item.machine_id)
			if (map[key] == undefined) {
				let kpi = qty_gas / item.quantity;
				kpi = (item.quantity == 0 || qty_gas == 0) ? 0 : parseFloat(kpi.toFixed(2))
				formattedData.push({
					alloy_name: item.alloy_name,
					machine_id: item['machine_id'],
					machine_name: item['machine_name'],
					qty_alu: item.quantity,
					qty_gas: qty_gas,
					kpi,
					key
				});
				map[key] = formattedData.length - 1;
			} else {
				formattedData[map[key]].qty_alu += item.quantity;
				let kpi = formattedData[map[key]].qty_gas / formattedData[map[key]].qty_alu;
				formattedData[map[key]].kpi = (formattedData[map[key]].qty_gas == 0 || formattedData[map[key]].qty_alu == 0) ? 0 : parseFloat(kpi.toFixed(2));
			}
		});
		return formattedData.sort((a: any, b: any) => b.total - a.total);
	};

	private getEnergyValue(energyConsumptions: any, id: number) {
		let value = 0;
		energyConsumptions.map((item: any) => {
			if (item.machine_id == id) value += item.energy_consumption;
		})
		return value
	}

	private getConsumerGridColumns() {
		return [
			{
				name: 'machine_name',
				title: $localize`Furnece`,
				hasFooter: true,
				footerTemplate: $localize`Total`
			},
			{
				name: 'alloy_name',
				title: $localize`Alloy`
			},
			{
				name: 'qty_alu',
				title: $localize`Qty alu (kg)`,
				hasFooter: true,
				type: 'number'
			},
			{
				name: 'qty_gas',
				title: $localize`Qty gas (m3)`,
				hasFooter: true,
				type: 'number'
			},
			{
				name: 'kpi',
				title: $localize`KPI (m3/kg)`,
				hasFooter: true,
				type: 'number'
			}
		];
	}

	public aggregateList: Array<any> = [
		{ field: "qty_alu", aggregate: "sum" },
		{ field: "qty_gas", aggregate: "sum" },
		{ field: "kpi", aggregate: "sum" },
	]
}