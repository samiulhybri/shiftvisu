import { Component } from '@angular/core';
import { IntlService } from '@progress/kendo-angular-intl';
import { AxisLabelContentArgs, Legend, SeriesLabelsContentArgs } from '@progress/kendo-angular-charts';
import { addDays } from '@progress/kendo-date-math';
import { orderBy } from '@progress/kendo-data-query';
import { GridProperty } from '@app/shared/classes/grid-property';
import * as moment from 'moment';
// Services
import { CommonService } from '@app/shared/services/common.service';
import { EnerVisuService } from '@app/modules/ener-visu/services/ener-visu.service';

// Enums
import { BarType } from '@app/shared/components/kendo/bar-chart/enums/bar-type.enum';
import { EnergyTypeClass, EnergyType } from '@app/enums/energy-type.enum';
import { DurationTypeClass, DurationType } from '@app/enums/duration-type.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-enerygy-consumption',
	templateUrl: './enerygy-consumption.component.html',
	styleUrls: ['./enerygy-consumption.component.scss']
})
export class EnerygyConsumptionComponent extends GridProperty {
	public currentTime: Date = new Date();
	public durationList: Array<any> = [];
	public selectedPeriods: Array<any> = [];
	public selectedConsumers: Array<any> = [];
	public selectedConsumersOnTable: Array<any> = [];
	public selectedContents: Array<String> = [];
	public consumers: Array<any> = [];
	public consumptions: Array<any> = [];
	public isLoading: boolean = false;
	public gridConsumptionTotal: number = 0;
	public popupButtonText = $localize`Filter`;

	public defaultItem: { text: string; value: any } = {
		text: $localize`Select item...`,
		value: null,
	};

	public listItems: Array<{ text: string; value: string }> = EnergyTypeClass.getEnergyType();
	public durationItems: Array<{ text: string; value: string }> = DurationTypeClass.getDurationType();

	public selectedValue: any = {
		type: EnergyType.ELECTRICITY,
		startDate: addDays(this.currentTime, -13),
		endDate: this.currentTime,
		duration: DurationType.DAY
	}

	public legend: Legend = {
		visible: false
	};

	public valueAxis = {
		labels: {
			rotation: 'auto'
		}
	}

	get currentBarValue(): BarType {
		return BarType.COLUMN;
	}

	public consumerSelection: any = {};
	public periodSelection: any = {};
	public periodSeriesData: Array<any> = [
		{
			data: []
		}
	];
	public periodMaxValue = undefined;


	public consumerCategories: Array<any> = [];
	public consumerSeriesData: Array<any> = [
		{
			data: []
		}
	];
	public consumerMaxValue = undefined;

	public seriesBorderOption = {
		width: 0
	};

	public majorGridLines = {
		visible: true
	}

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
			this.selectedConsumers = [];
			this.selectedPeriods = [];
			this.selectedConsumersOnTable = [];
			this.selectedContents = [];
		}
		this.prepareData();
	}

	public consumerGridColumns = this.getConsumerGridColumns();
	public selectedHalle: string = '';
	public selectedConsumerGroup: string = '';
	public consumerIds: string = '';

	constructor(
		private route: ActivatedRoute,
		_commonService: CommonService,
		public enerVisuService: EnerVisuService,
		public intl: IntlService
	) {
		super(_commonService);
	}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			this.selectedHalle = params['halle'];
			this.selectedConsumerGroup = params['consumer_group'];
		});

		this.getConsumers();
	}

	public getConsumers() {
		this.isLoading = true;
		let url = "EnergyConsumers?$select=id,name,custom_id";
		if(this.selectedConsumerGroup && this.selectedConsumerGroup != '') 
			url = `EnergyConsumers?$select=id,name,custom_id&filter=energy_consumer_group_id eq ${ this.selectedConsumerGroup }`;

		this._commonService.get(url).subscribe({
			next: (response: any) => {
				this.isLoading = false;
				this.consumers = response.value;
				this.consumerIds = response.value.map((obj: any) => obj.id).join(',');
				this.consumers.map(consumer => {
					this.consumerCategories.push(consumer.name)
				})
			}
		})
	}

	public loadData(event: any) {
		this.selectedValue = event.selectedValue;
		this.durationList = event.durationList;
		console.log(this.durationList);

		this.getConsumptions(this.selectedValue.startDate, this.selectedValue.endDate);
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
		console.log(start, end);

		const startDate = this.intl.formatDate(this.getUTCDateTime(start), "yyyy-MM-dd HH:mm:ss");
		const endDate = this.intl.formatDate(this.getUTCDateTime(end), "yyyy-MM-dd HH:mm:ss");
		let url = `EnergyConsumptions?filter=consumption_hour ge '${startDate}' and consumption_hour le '${endDate}' and energy_type eq '${this.selectedValue.type}'&$top=10000000`; 
		if(this.consumerIds && this.consumerIds != '') 
			url = `EnergyConsumptions?filter=consumption_hour ge '${startDate}' and consumption_hour le '${endDate}' and energy_type eq '${this.selectedValue.type}' and energy_consumer_id in (${ this.consumerIds })&$top=10000000`;

		this._commonService.get(`${url}`).subscribe({
			next: (response: any) => {
				this.isLoading = false;
				let consumptionsList: Array<any> = [];
				response.value.map((item: any) => {
					var temp = this.getConsumerInfo(item.energy_consumer_id, 'custom_id');
					if(temp) {
						consumptionsList.push({
							...item,
							period: this.getPeriod(item.consumption_hour),
							consumer_custom_id: this.getConsumerInfo(item.energy_consumer_id, 'custom_id'),
							consumer_name: this.getConsumerInfo(item.energy_consumer_id, 'name')
						});
					}
				})
				this.consumptions = consumptionsList;
				this.refreshReport('all')
			}
		})
	}

	public prepareData() {
		let arr = [...this.consumptions];
		console.log([...arr]);
		arr = arr.filter(this.useConditions(this.getFiltersKeyValue()))
		console.log([...arr]);
		if (!this.selectedConsumersOnTable.length) this.distributeReport(arr, 'consumerTable');
		this.distributeReport(arr, 'consumerChart')
		this.distributeReport(arr, 'periodChart')
	}

	public distributeReport(arr: Array<any>, type: string) {
		switch (type) {
			case 'consumerTable':
				let consumerResult = this.formatData(arr, 'energy_consumer_id', 'consumer_name', 'energy_consumption')
				console.log(consumerResult);
				this.gridItems = {
					total: consumerResult.length,
					data: consumerResult
				}
				this.isLoadedEnabled = false
				break;
			case 'periodChart':
				this.preparePeriodChart(arr);
				break;
			case 'consumerChart':
				this.prepareConsumerChart(arr);
				break;
			default:
				break;
		}
	}

	public preparePeriodChart(arr: Array<any>) {
		if (this.selectedPeriods.length) {
			this.periodSeriesData[0].data = this.periodSeriesData[0].data.map((item: any) => {
				return {
					...item,
					color: this.selectedPeriods.includes(item.category) ? '#53A553' : '#f7cabb'
				}
			})
		} else {
			let consumptionValues = []
			for (let i = 0; i < this.durationList.length; i++) {
				let consumption = 0;
				arr.map(item => {
					if (item.period == this.durationList[i]) consumption += item.energy_consumption
				})
				consumptionValues.push({
					value: consumption,
					category: this.durationList[i],
					color: '#53A553'
				})
			}
			this.periodSeriesData[0].data = consumptionValues
		}
		let maxValue: any = Math.max.apply(Math, this.periodSeriesData[0].data.map((o: any) => { return o.value; }))

		if (maxValue == 0) {
			this.periodMaxValue = undefined;
		} else {
			this.periodMaxValue = maxValue + (maxValue / 2);
		}
	}

	public prepareConsumerChart(arr: Array<any>) {
		if (this.selectedConsumers.length) {
			this.consumerSeriesData[0].data = this.consumerSeriesData[0].data.map((item: any) => {
				return {
					...item,
					color: this.selectedConsumers.includes(item.category) ? '#53A553' : '#f7cabb'
				}
			})
		} else {
			let consumptionValues = []
			for (let i = 0; i < this.consumerCategories.length; i++) {
				let consumption = 0;
				arr.map(item => {
					if (item.consumer_name == this.consumerCategories[i]) consumption += item.energy_consumption
				})
				consumptionValues.push({
					value: consumption,
					category: this.consumerCategories[i],
					color: '#53A553'
				})
			}

			this.consumerSeriesData[0].data = orderBy(consumptionValues, [{ field: 'value', dir: 'desc' }]);
			let consumerCategories: Array<any> = [];
			this.consumerSeriesData[0].data.map((item: any) => {
				consumerCategories.push(item.category)
			})
			this.consumerCategories = consumerCategories
			if (this.consumerSeriesData[0].data[0].value == 0) {
				this.consumerMaxValue = undefined;
			} else {
				this.consumerMaxValue = this.consumerSeriesData[0].data[0].value + (this.consumerSeriesData[0].data[0].value / 2);
			}
		}
	}

	public getConsumerInfo(id: number, key: string) {
		const found = this.consumers.find(consumer => consumer.id == id)
		return found ? found[key] : null;
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
			this.periodSelection = {
				from: this.durationList.indexOf(event.category),
				to: this.durationList.indexOf(event.category) + 1
			}
			this.selectedPeriods = [event.category]
		}

		this.prepareData()
	}

	public consumerSeriesEvent(event: any) {
		if (event.originalEvent.event.ctrlKey) {
			let selectedIndex = this.selectedConsumers.indexOf(event.category)
			if (this.selectedConsumers.includes(event.category)) {
				if (this.selectedConsumers.length == 1) return
				this.selectedConsumers.splice(selectedIndex, 1)
			} else {
				this.selectedConsumers = [...this.selectedConsumers, event.category]
			}
		} else {
			if (this.selectedConsumers.includes(event.category)) return
			this.consumerSelection = {
				from: this.consumerCategories.indexOf(event.category),
				to: this.consumerCategories.indexOf(event.category) + 1
			}
			this.selectedConsumers = [event.category]
		}

		this.prepareData()
	}

	public consumerGridRowSelect(event: any) {
		const selectedItems = [...this.selectedConsumersOnTable];
		if (event.selectedRows.length) {
			event.selectedRows.map(({ dataItem }: any) => {
				selectedItems.push(dataItem.name)
			})
		}
		if (event.deselectedRows.length) {
			event.deselectedRows.map(({ dataItem }: any) => {
				let selectedIndex = selectedItems.indexOf(dataItem.name)
				if (selectedIndex != -1) selectedItems.splice(selectedIndex, 1)
			})
		}
		this.selectedConsumersOnTable = selectedItems;
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
			return this.intl.formatDate(new Date(date), 'MM-yyyy')
		}
		if (this.selectedValue.duration == DurationType.YEAR) {
			return this.intl.formatDate(new Date(date), 'yyyy')
		}
	}

	private getFiltersKeyValue = () => {
		let filters: any = {};
		if (this.selectedPeriods.length) filters.period = this.selectedPeriods
		if (this.selectedConsumers.length) filters.consumer_name = this.selectedConsumers
		if (this.selectedConsumersOnTable.length) filters.consumer_name = this.selectedConsumersOnTable
		return filters
	}

	private formatData = (data: any, idKey: any, nameKey: any, valueKey: any) => {
		let formattedData: any = [];
		data.forEach((item: any) => {
			const id = item[idKey];
			const name = item[nameKey];
			const value = item[valueKey];
			const index = formattedData.findIndex((item: any) => item.id === id);
			if (index > -1) {
				formattedData[index].total += value;
			} else {
				formattedData.push({ id, name, total: value });
			}
		});

		return formattedData
			.sort((a: any, b: any) => b.total - a.total);
	};

	private getConsumerGridColumns() {
		return [
			{
				name: 'name',
				title: $localize`Consumer`,
				hasFooter: true,
				footerTemplate: $localize`Total`
			},
			{
				name: 'total',
				title: $localize`Consumption`,
				hasFooter: true,
				type: 'number'
			}
		];
	}

	public aggregateList: Array<any> = [
		{ field: "total", aggregate: "sum" }
	]
}