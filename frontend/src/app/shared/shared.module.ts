import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { GridModule } from '@progress/kendo-angular-grid';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { UploadsModule } from '@progress/kendo-angular-upload';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { EditorModule } from '@progress/kendo-angular-editor';
import { ScrollViewModule } from '@progress/kendo-angular-scrollview';
import { AppBarModule } from '@progress/kendo-angular-navigation';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { IconsModule } from "@progress/kendo-angular-icons";
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';

import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { GridComponent } from './components/kendo/grid/grid.component';
import { GridEditWindowComponent } from './components/kendo/grid/grid-edit-window.component';
import { LoaderComponent } from './components/loader/loader.component';
import { GridInlineComponent } from '../shared/components/kendo/grid-inline/grid-inline.component';
import { BarChartComponent } from './components/kendo/bar-chart/bar-chart.component';

import { DropDownListFilterComponent } from './components/kendo/grid/filter-componets/dropdownlist-filter.component';

import { ODataModule } from 'angular-odata';
import { environment } from 'src/environments/environment';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { CardComponent } from './components/kendo/card/card.component';
import { ChatModule } from '@progress/kendo-angular-conversational-ui';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { SchedulerComponent } from './components/kendo/scheduler/scheduler.component';
import { HallComponent } from './components/hall/hall.component';
import { ListViewComponent } from './components/kendo/list-view/list-view.component';
import { DateRangeComponent } from './components/kendo/date-range/date-range.component';
import { HAMMER_LOADER } from '@angular/platform-browser';
import { Notification } from './services/notification.service';
import { PopupComponent } from './components/kendo/popup/popup.component';
import { IntlModule } from '@progress/kendo-angular-intl';
import { OrderByKeyPipe } from './pipes/order-by-key.pipe';
import { FilterDialogComponent } from './components/filter-dialog/filter-dialog.component';
import { ComboboxFilterPipe } from './pipes/combobox-filter.pipe';
import { AttachmentPreviewComponent } from './components/attachment-preview/attachment-preview.component';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { AddSuffixOnValuePipe } from './pipes/add-suffix-on-value.pipe';

export function hammerLoader() {
	return new Promise(() => import('hammerjs'));
}

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		HttpClientModule,
		ReactiveFormsModule,
		GridModule,
		DialogsModule,
		ButtonsModule,
		InputsModule,
		DateInputsModule,
		DropDownsModule,
		UploadsModule,
		LabelModule,
		LayoutModule,
		EditorModule,
		ChartsModule,
		ScrollViewModule,
		AppBarModule,
		ListViewModule,
		IconsModule,
		SchedulerModule,
		NotificationModule,
		PopupModule,
		ODataModule.forRoot({
			serviceRootUrl: `${environment.lodataPrefix}`
		}),
		IntlModule
	],
	exports: [
		HeaderComponent,
		SidebarComponent,
		BarChartComponent,
		CommonModule,
		FormsModule,
		HttpClientModule,
		ReactiveFormsModule,
		UploadsModule,
		LabelModule,
		GridModule,
		DialogsModule,
		ButtonsModule,
		InputsModule,
		DateInputsModule,
		DropDownsModule,
		GridComponent,
		GridEditWindowComponent,
		LoaderComponent,
		GridInlineComponent,
		LabelModule,
		LayoutModule,
		EditorModule,
		ScrollViewModule,
		AppBarModule,
		ListViewModule,
		IconsModule,
		CardComponent,
		ChatModule,
		PopupModule,
		IconsModule,
		SchedulerModule,
		SchedulerComponent,
		HallComponent,
		ListViewComponent,
		DateRangeComponent,
		NotificationModule,
		PopupModule,
		PopupComponent,
		IntlModule,
		OrderByKeyPipe,
		FilterDialogComponent,
		AttachmentPreviewComponent,
		SafeUrlPipe,
		AddSuffixOnValuePipe
	],
	declarations: [
		HeaderComponent,
		SidebarComponent,
		GridComponent,
		GridEditWindowComponent,
		LoaderComponent,
		GridInlineComponent,
		BarChartComponent,
		CardComponent,
		SchedulerComponent,
		HallComponent,
		ListViewComponent,
		DateRangeComponent,
		DropDownListFilterComponent,
		PopupComponent,
		OrderByKeyPipe,
        FilterDialogComponent,
        ComboboxFilterPipe,
		AttachmentPreviewComponent,
 		SafeUrlPipe,
   		AddSuffixOnValuePipe
	],
	providers: [
		{
			provide: HAMMER_LOADER,
			useFactory: hammerLoader
		},
		Notification
	]
})
export class SharedModule { }