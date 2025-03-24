import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarType } from './enums/bar-type.enum';
import { BarChartComponent } from './bar-chart.component';

import {
	EventSeriesOptions,
	SeriesClickEvent,
} from '@progress/kendo-angular-charts';

describe('BarChartComponent', () => {
	let component: BarChartComponent;
	let fixture: ComponentFixture<BarChartComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BarChartComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BarChartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit seriesClick event when onSeriesClick is called', () => {
		const seriesClickEvent: SeriesClickEvent = {
			category: 'category',
			dataItem: {},
			percentage: 0,
			series: {
				index: 1,
				name: 'Series 1',
				visible: true,
			} as EventSeriesOptions,
			value: 0,
			originalEvent: {} as Event,
			point: {},
			stackValue: 10,
			sender: {} as any,
		};

		spyOn(component.seriesClick, 'emit');
		component.onSeriesClick(seriesClickEvent);
		expect(component.seriesClick.emit).toHaveBeenCalledWith(
			seriesClickEvent
		);
	});

	it('should set default values for inputs', () => {
		expect(component.columns).toEqual([]);
		expect(component.categories).toEqual([]);
		expect(component.title).toEqual('title');
		expect(component.subtitle).toEqual('');
		expect(component.categoryAxisTitle).toEqual('');
		expect(component.categoryAxisLabels).toEqual({});
		expect(component.seriesData).toEqual([]);
		expect(component.colors).toEqual([]);
		expect(component.legend).toEqual({});
		expect(component.valueAxis).toEqual({});
		expect(component.valueAxisTitle).toEqual('');
		expect(component.valueAxisLabels).toEqual({});
		expect(component.valueAxisMajorTicks).toEqual({});
		expect(component.valueAxisMinorTicks).toEqual({});
		expect(component.valueAxisPlotBands).toEqual([]);
		expect(component.barType).toEqual(BarType.BAR);
		expect(component.myHeight).toEqual('');
		expect(component.gap).toEqual(1);
		expect(component.spacing).toEqual(0.5);
		expect(component.tooltip).toEqual({ visible: true });
		expect(component.xAxis).toEqual({ majorGridLines: { visible: false } });
		expect(component.yAxis).toEqual({ majorGridLines: { visible: true } });
		expect(component.isHidden).toEqual(false);
	});
});
