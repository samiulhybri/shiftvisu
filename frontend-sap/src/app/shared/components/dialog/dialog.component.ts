import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	ViewContainerRef,
	input,
} from "@angular/core";
import "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Button";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";

@Component({
	selector: "app-dialog",
	templateUrl: "./dialog.component.html",
})
export class DialogComponent implements OnInit {
	@Input() isDialogOpen?: boolean;
	@Input() title?: string;
	@Input() state: keyof typeof ValueState = "None";
	@Output() public onBeforeClose = new EventEmitter<object>();

	ngOnInit(): void {}
	@ViewChild("container", { read: ViewContainerRef })
	container!: ViewContainerRef;

	constructor(private route: ActivatedRoute, private router: Router) {}

	openDialog(): void {}

	closeDialog(): void {
		this.router.navigate(["../"], { relativeTo: this.route }).catch(() => {
			this.router.navigate(["../../"], { relativeTo: this.route });
		});
	}

	beforeClosed(event: any) {
		if (this.onBeforeClose) this.onBeforeClose.emit(event);
	}
}
