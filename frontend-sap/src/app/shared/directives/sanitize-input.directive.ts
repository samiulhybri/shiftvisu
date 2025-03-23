import {
	Directive,
	HostListener,
	ElementRef,
	Input,
	Optional,
	Self,
} from "@angular/core";
import { NgControl } from "@angular/forms";

import { timer } from "rxjs";

@Directive({
	selector: "[sanitize-input]",
})
export class SanitizeInputDirective {
	@Input() excludeCharacters: string | null = null;
	
	constructor(
		private el: ElementRef,
		@Self() @Optional() private _control: NgControl
	) {
		(el.nativeElement as HTMLInputElement).value = "";
	}

	@HostListener("keypress", ["$event"])
	onInput(event: any) {
		return this.sanitizeOnInput(event);
	}

	@HostListener("paste", ["$event"])
	onPaste(event: any) {
		return this.sanitizeOnPaste(event);
	}

	@HostListener("blur", ["$event"])
	onBlur(event: any) {
		return this.trimOnBlur(event);
	}

	trimOnBlur(event: any) {
		let trimmedInput = this.el.nativeElement.value.trim();
		this.el.nativeElement.value = trimmedInput;
		this._control?.control?.setValue(trimmedInput);
	}

	sanitizeOnInput(event: any) {
		var input = String.fromCharCode(event.keyCode);

		if (this.excludeCharacters?.includes(input)) {
			event.preventDefault();
			return false;
		} else {
			this._control?.control?.setValue(this.el.nativeElement.value);
			return true;
		}
	}

	sanitizeOnPaste(event: ClipboardEvent) {
		timer(0).subscribe(() => {
			let sanitizedValue: string = this.el.nativeElement.value;
			if (this.excludeCharacters) {
				Array.from(this.excludeCharacters).forEach(c => {
					sanitizedValue = sanitizedValue.replaceAll(c, "");
				});
				this.el.nativeElement.value = sanitizedValue;
				this._control?.control?.setValue(sanitizedValue);
			}
		});

		return true;
	}
}
