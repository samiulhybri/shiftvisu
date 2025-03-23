import { NgModule } from "@angular/core";

/** Angular / React Components */
import { FormsModule, NG_VALIDATORS, ReactiveFormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";
import { Ui5FioriModule, Ui5WebcomponentsModule } from "@ui5/webcomponents-ngx";
import { WebcamModule } from "ngx-webcam";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";

/** APP Coomponents */
import { DialogComponent } from "@app/shared/components/dialog/dialog.component";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { AttachmentUploadComponent } from "@app/shared/components/attachment-upload/attachment-upload.component";
import { FilePreviewComponent } from "@app/shared/components/file-preview/file-preview.component";

/** Support Pipes */
import { HexToRgbaByOpacityPipe } from "@app/shared/pipes/hex-to-rgba-by-opacity.pipe";
import { FileSizePipe } from "@app/shared/pipes/file-size.pipe";
import { TruncatePipe } from "@app/shared/pipes/truncate.pipe";
import { SafeUrlPipe } from "@app/shared/pipes/safeURL/safe-url.pipe";
import { DateFormatPipe } from "@app/shared/pipes/date-format.pipe";
import { PlantSelectorComponent } from "@app/shared/components/plant-selector/plant-selector.component";
import { GenericTagComponent } from "@app/shared/components/generic-tag/generic-tag.component";
import { CdkDrag, CdkDropList, CdkDropListGroup } from "@angular/cdk/drag-drop";
import { TranslationComponent } from "@app/shared/components/translation/translation.component";
import { AssociateSelectorComponent } from "@app/shared/components/associate-selector/associate-selector.component";
import { TextEditorComponent } from "./components/text-editor/text-editor.component";
import { HeaderComponent } from "@app/modules/home-page/header/header.component";
import { AssociatePreviewDialogComponent } from "@app/shared/components/associate-preview-dialog/associate-preview-dialog.component";
import { RouterModule } from "@angular/router";
import { ItemImageComponent } from "@app/modules/machine-board/item-image/item-image.component";
import { GridWorkloadComponent } from "@app/shared/charts/grid-workload/grid-workload.component";
import { BarChartsComponent } from "@app/shared/charts/bar-charts/bar-charts.component";
import { SanitizeInputDirective } from "@app/shared/directives/sanitize-input.directive";
import { NumericInputValidatorDirective } from "@app/shared/directives/numeric-input-validator.directive";
import { LineGraphsComponent } from "./charts/line-graphs/line-graphs.component";
import { SidebarComponent } from "@app/shared/components/sidebar/sidebar.component";
import { CrmActionGridComponent } from "./charts/crm-action-grid/crm-action-grid.component";
import { VerticalBarChartComponent } from "./charts/vertical-bar-chart/vertical-bar-chart.component";
import { ChatComponent } from "@app/shared/components/chat/chat.component";

@NgModule({
	imports: [
		Ui5FioriModule,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		Ui5WebcomponentsModule,
		CdkDropListGroup,
		CdkDropList,
		CdkDrag,
		WebcamModule,
		CKEditorModule,
		RouterModule,
	],
	exports: [
		FormsModule,
		ReactiveFormsModule,
		DialogComponent,
		CustomReactGridTable,
		AttachmentUploadComponent,
		HexToRgbaByOpacityPipe,
		FileSizePipe,
		TruncatePipe,
		SafeUrlPipe,
		FilePreviewComponent,
		Ui5WebcomponentsModule,
		DateFormatPipe,
		PlantSelectorComponent,
		GenericTagComponent,
		CdkDropListGroup,
		CdkDropList,
		CdkDrag,
		WebcamModule,
		TranslationComponent,
		AssociateSelectorComponent,
		TextEditorComponent,
		CKEditorModule,
		HeaderComponent,
		AssociatePreviewDialogComponent,
		RouterModule,
		ItemImageComponent,
		GridWorkloadComponent,
		BarChartsComponent,
		SanitizeInputDirective,
		NumericInputValidatorDirective,
		LineGraphsComponent,
		SidebarComponent,
		CrmActionGridComponent,
		VerticalBarChartComponent,
		ChatComponent,
	],
	declarations: [
		DialogComponent,
		CustomReactGridTable,
		AttachmentUploadComponent,
		HexToRgbaByOpacityPipe,
		FileSizePipe,
		TruncatePipe,
		FilePreviewComponent,
		SafeUrlPipe,
		DateFormatPipe,
		PlantSelectorComponent,
		GenericTagComponent,
		TranslationComponent,
		AssociateSelectorComponent,
		TextEditorComponent,
		HeaderComponent,
		AssociatePreviewDialogComponent,
		ItemImageComponent,
		GridWorkloadComponent,
		BarChartsComponent,
		SanitizeInputDirective,
		NumericInputValidatorDirective,
		LineGraphsComponent,
		SidebarComponent,
		CrmActionGridComponent,
		VerticalBarChartComponent,
		ChatComponent,
	],
	providers: [DateFormatPipe, DatePipe],
})
export class SharedModule {}
