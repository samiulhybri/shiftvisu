import { ChangeDetectorRef, Component, ContentChild, ElementRef, HostListener, Input, TemplateRef, ViewChild } from '@angular/core';
@Component({
	selector: 'app-popup',
	templateUrl: './popup.component.html',
	styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

	@Input() buttonText = "Popup";
	@Input() hide = true;
	@Input() anchorAlign = { horizontal: "right", vertical: "bottom" };
	@Input() popupAlign = { horizontal: "right", vertical: "top" };
	@Input() icon = "";
	@ContentChild('content', { static: true }) content!: TemplateRef<any>;

	constructor(
		private cdRef: ChangeDetectorRef
	) {

	}

	ngOnInit() {
		this.cdRef.detectChanges();
	}

	public onToggle(): void {
		this.hide = !this.hide;
	}

	@ViewChild("anchor", { read: ElementRef }) public anchor!: ElementRef;
	@ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;


	@HostListener("document:keydown", ["$event"])
	public keydown(event: KeyboardEvent): void {
		console.log(event);
		if (event.code === "Escape") {
			this.hide = true;
		}
	}

	@HostListener("document:click", ["$event"])
	public documentClick(event: MouseEvent): void {
		const targetElement = event.target as HTMLElement;
		const condition = targetElement.closest('.k-calendar-container') || targetElement.closest('.k-item') || targetElement.closest('.k-time-container') || targetElement.closest('.k-timeselector')
		if (condition) {
			event.stopPropagation();
		} else if (!this.contains(targetElement)) {

			this.hide = true;
		}
	}

	private contains(target: HTMLElement) {

		if (target) {
			if (target.closest('.k-i-calendar') || target.closest('.k-link') || target.closest('.k-time-accept') || target.closest('.k-time-now') || target.closest('.k-time-cancel')
			) {
				return true;
			} else {
				return this.anchor.nativeElement.contains(target) ||
					(this.popup ? this.popup.nativeElement.contains(target) : false)
			}
		}
	}
}
