import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BarType } from './enums/bar-type.enum';
import { Legend, PlotAreaClickEvent, SelectEndEvent, SeriesClickEvent } from '@progress/kendo-angular-charts';

@Component({
	selector: 'app-bar-chart',
	templateUrl: './bar-chart.component.html',
	styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent {
	@Input('columns') columns = [];
	@Input('categories') categories: string[] = [];
	@Input('title') title: string = 'title';
	@Input('titleIsVisible') titleIsVisible: boolean = true;
	@Input('subtitle') subtitle: string = '';
	@Input('categoryAxisTitle') categoryAxisTitle = '';
	@Input('categoryAxisLabels') categoryAxisLabels = {};
	@Input('data') seriesData: any = [];
	@Input('colors') colors: string[] = [];
	@Input('legend') legend: Legend = {};
	@Input('valueAxis') valueAxis: {} = {};
	@Input('valueAxisTitle') valueAxisTitle = '';
	@Input('valueAxisLabels') valueAxisLabels = {};
	@Input('valueAxisMajorTicks') valueAxisMajorTicks = {};
	@Input('valueAxisMinorTicks') valueAxisMinorTicks = {};
	@Input('valueAxisPlotBands') valueAxisPlotBands = [];
	@Input('type') barType: BarType = BarType.BAR;
	@Input('myHeight') myHeight: string = '';
	@Input('gap') gap: number = 1;
	@Input('spacing') spacing: number = 0.5;
	@Input('tooltip') tooltip = { visible: true };
	@Input('xAxis') xAxis = { majorGridLines: { visible: false } };
	@Input('yAxis') yAxis = { majorGridLines: { visible: false } };
	@Input('isHidden') isHidden: boolean = false;
	@Input('selection') selection = false;
	@Input('transitions') transitions = true;
	@Input('seriesBorderOption') seriesBorderOption = {};
	@Input() seriesLabelContent = {};
	@Input() valueAxisLabelContent = {};
	@Input() valueAxisLabelRotation = 'auto';
	@Input() categorieLabelRotation = 'auto';
	@Input() categoryAxisLabelContent = {};
	@Input() maxValue = undefined;
	@Input() majorGridLines = {};

	@Output() seriesClick = new EventEmitter<SeriesClickEvent>();

	onSeriesClick(event: SeriesClickEvent): void {
		this.seriesClick.emit(event);
	}

	@Output() plotAreaClick = new EventEmitter<PlotAreaClickEvent>();

	onPlotAreaClick(event: PlotAreaClickEvent): void {
		this.plotAreaClick.emit(event);
	}

	@Output() selectEnd = new EventEmitter<SelectEndEvent>();

	onSelectEnd(event: SelectEndEvent): void {
		this.selectEnd.emit(event);
	}
}
