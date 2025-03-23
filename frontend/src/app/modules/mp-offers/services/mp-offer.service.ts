import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class MpOfferService {
	private isLeave = new BehaviorSubject<boolean>(false);
	isLeave$ = this.isLeave.asObservable();

	private _isFormDirty = new BehaviorSubject<boolean>(false);
	isDirty$ = this._isFormDirty.asObservable();

	public isHome: boolean = false;
	public pathLink: string = '';
	public ctrlKeyPressed: boolean = false;
	public isCloneWarningMsg: boolean = false;
	public clonetype: string = '';

	constructor() { }

	navigateToExternalUrl(url: string): void {
		window.location.href = url;
	}

	updateValue(newValue: boolean) {
		this.isLeave.next(newValue);
	}

	markAsDirty() {
		this._isFormDirty.next(true);
	}

	markAsClean() {
		this._isFormDirty.next(false);
	}

	openNewTab(url: string) {
		window.open(url, '_blank');
		this.isHome = false;
		this.ctrlKeyPressed = false;
	}
}
