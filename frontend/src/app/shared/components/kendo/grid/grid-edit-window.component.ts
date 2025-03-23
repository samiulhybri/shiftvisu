import { Component, Input, Output, EventEmitter, ComponentRef } from '@angular/core';
import { AbsenceManagerPageType } from '@app/enums/absence-manager-page-type';
import {RequestService} from '@app/modules/absence-manager/services/request.service';
import {AbsenceManagerButtonType} from '@app/enums/absence-manager-button'

@Component({
	selector: 'kendo-grid-edit-window',
	styles: [
		`	::ng-deep .k-window-content.k-dialog-content{
			overflow: hidden;
		}
			::ng-deep .k-dialog.k-window {
				max-height: 93vh !important;
			}

			.k-dialog-actions {
				justify-content: end;
			}

			.k-actions-stretched > * {
				flex: unset !important;
			}

			:host {
				position: relative;
			}
			::ng-deep .k-button-text{
				display: flex;
				align-items: center;
				gap: 3px;
			}

			@media screen and (min-width: 850px) and (max-width: 2000px) {
				::ng-deep #without_assessment_copy .k-button-text, ::ng-deep #with_assessment_copy .k-button-text {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					display: block;
				}
			}
		`
	],
	template: `
        <kendo-dialog
			*ngIf="active"
			[width]="width"
			(close)="onCancel($event)"
		>
			<kendo-dialog-titlebar>
				<span *ngIf="isNew" i18n>{{ windowCustomTitle ?? 'Add' }}</span>
				<span *ngIf="!isNew" i18n>{{ detailsWindowCustomTitle ?? 'Details'}}</span>
			</kendo-dialog-titlebar>

			<ng-content></ng-content>

			<app-loader *ngIf="isWindowLoaderEnabled"></app-loader>
			
			<kendo-dialog-actions *ngIf="isShowAction">
				<button kendoButton (click)="onCancel($event)" *ngIf="showCloseButton" i18n>
					<span class="k-icon icon-close"></span> Close
				</button>
				<button kendoButton [disabled]="true"   *ngIf="isNew && requestService.isNewRequestModal" i18n>
					<span class="k-icon icon-save"></span> Save Draft
				</button>
				<button  style="background:#FF6358; color:white" kendoButton  (click)="customSaveAbsencemanagerPage($event, absenceManagerButtonTypeEnum.DECLINE)"  *ngIf="requestService.absenceManagerPageType === absenceManagerPageTypeEnum.REQUEST && requestService.isRequestActionButtonsVisible" i18n>
					<span class="k-icon icon-ban"></span> Decline
				</button>
				<button kendoButton themeColor="primary"  (click)="customSaveAbsencemanagerPage($event,absenceManagerButtonTypeEnum.APPROVE)"  *ngIf="requestService.absenceManagerPageType === absenceManagerPageTypeEnum.REQUEST && requestService.isRequestActionButtonsVisible" i18n>
					<span class="k-icon icon-check"></span> Approve 
				</button>
				<button kendoButton themeColor="primary" (click)="onSave($event)" i18n *ngIf="isNew && !requestService.isAbsenceManagerStart" [hidden]="hideSaveOrUpdateBtn">
					<span class="k-icon icon-save"></span> Save
				</button>
				
				<kendo-button themeColor="primary" imageUrl="assets/icons/send-w.png" (click)="onSave($event)" *ngIf="isNew && requestService.isNewRequestModal" 
					  i18n>Send
				</kendo-button>
				<button kendoButton themeColor="primary" (click)="onSave($event)" i18n *ngIf="!isNew && !requestService.isAbsenceManagerStart" [hidden]="hideSaveOrUpdateBtn">
					<span class="k-icon icon-save"></span> Update
				</button>
			</kendo-dialog-actions>
    	</kendo-dialog>
    `
})
export class GridEditWindowComponent {
	constructor(private requestService: RequestService){
		
	}
	public active: boolean = false;
	public dataItem :any;
	public component!: ComponentRef<any>;
	@Input() isWindowLoaderEnabled: boolean = false;
	@Input() public isNew = false;
	@Input() public windowCustomTitle?:string;// add window custom title
	@Input() public detailsWindowCustomTitle?:string;// add window custom title
	@Input() public hideSaveOrUpdateBtn = false;
	@Input() public width: any;
	@Input() public isShowAction: boolean = true;
	@Input() public showCloseButton = true;
	@Input() public set model(dataItem: any) {
	
		this.active = dataItem !== undefined;
	}
	@Input() public set closeGridWindow(dataItem: any) {
		this.dataItem = dataItem
		if (dataItem) this.closeWindow()
	}
	@Output() cancel: EventEmitter<any> = new EventEmitter();
	@Output() save: EventEmitter<any> = new EventEmitter();
	public absenceManagerPageTypeEnum = AbsenceManagerPageType;
	public absenceManagerButtonTypeEnum = AbsenceManagerButtonType;
	public onSave(e: PointerEvent): void {
		e.preventDefault();
		this.save.emit(e);
	}

	public onCancel(e: PointerEvent): void { 
		e.preventDefault();
		this.cancel.emit(e);
	}

	public closeWindow(): void {
		this.active = false;
	}
	customSaveAbsencemanagerPage(e: PointerEvent, type=''){
		this.requestService.statusAction = type;
		this.onSave(e)
	}
}