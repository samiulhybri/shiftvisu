import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Section } from '@app/shared/interfaces/section';
import { AuthService } from '@app/shared/services/auth.service';
import { CommonService } from '@app/shared/services/common.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    @Input() public sidebars!: any[];
    @Input() public isSideNavCollapsed: boolean = false;

    @Output() public selectedMenu: EventEmitter<any> = new EventEmitter();

    public sections: Section[] = [];
    public showButton: boolean = false;
    
    constructor(
        public router: Router,
        public authService: AuthService,
        public commonService: CommonService
    ) {}

    public sideNavigationSelectionChange(event: Event): void {
		const selectedItemId = (<CustomEvent>event).detail.item.id;
		const item = (<CustomEvent>event).detail.item as any;
		item.expanded = true;
		this.navigateSection(selectedItemId);
		item.toggleAttribute("expanded", "true");

		for (let section of this.sections) {
			if (section.id === selectedItemId) setTimeout(() => item.removeAttribute("selected"));
		}
	}

    public navigateSection(sectionName: any) {
        this.selectedMenu.emit(sectionName);
    }

    toggleSideNavCollpaseState(expandOnly: boolean = false) {
        if (expandOnly) this.isSideNavCollapsed = false;
        else this.isSideNavCollapsed = !this.isSideNavCollapsed;
    }
}
