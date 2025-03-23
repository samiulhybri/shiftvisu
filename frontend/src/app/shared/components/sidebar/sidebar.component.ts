import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DrawerComponent, DrawerItem, DrawerItemExpandedFn, DrawerSelectEvent } from '@progress/kendo-angular-layout';
import { Location } from '@angular/common';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent {
	@Input() sidebarMenu!: Array<DrawerItem>;
	@Input() setting?: any;
	@ViewChild("drawer") drawer!: DrawerComponent;

	public expandedIndices = [0];
	public isItemExpanded: DrawerItemExpandedFn = (item): boolean => {
		return this.expandedIndices.indexOf(item.id) >= 0;
	};
	constructor(
		private router: Router,
		private location: Location
	) { }

	public onSelect(ev: DrawerSelectEvent): void {

		if (ev.item.path) {
			this.router.navigate([ev.item.path]);
		}

		const current = ev.item.id;
		const parentId = ev.item.parentId;

		const isAlreadyExpanded = this.expandedIndices.indexOf(current) >= 0;

		if (isAlreadyExpanded) {
			this.expandedIndices = this.expandedIndices.filter((id) => id !== current);
		} else {
			if (parentId === undefined || this.expandedIndices.indexOf(parentId) === -1) {
				this.expandedIndices = [current];
			} else {
				this.expandedIndices.push(current);
			}
		}

		let isExpanded = this.expandedIndices.indexOf(current) >= 0;
		if(!this.expandedIndices.includes(22)) {
			this.drawer?.viewItems?.map((viewItem: any) => {
				if (viewItem.item.id === 22) {
					viewItem.item.cssClass = viewItem.item?.cssClass?.split(" ").filter((item: string) => item !== 'expanded').join(" ");
				}
			})
		}
		if (ev.item?.alignedToBottom) {
			this.drawer?.viewItems?.map((viewItem: any) => {
				if (viewItem.item.id === current) {
					if (isExpanded) {
						viewItem.item.cssClass = `${viewItem.item.cssClass || ''} expanded`;
					} else {
						viewItem.item.cssClass = viewItem.item?.cssClass?.split(" ").filter((item: string) => item !== 'expanded').join(" ");
					}
				} else {
					viewItem.item.cssClass = viewItem.item?.cssClass?.split(" ").filter((item: string) => item !== 'expanded').join(" ");
				}
			});
		}
	}

	public hasChildren(item: DrawerItem): boolean {
		return !!this.sidebarMenu.find(menu => menu.parentId === item.id) as boolean ?? false;
	}
	ngOnInit() {
		const currentUrl = this.location.path();

		this.sidebarMenu.forEach((menu: any) => {
			if (currentUrl == menu.path) {
				if (menu?.parentId) this.expandedIndices = [menu.parentId];
				if (menu?.isParent) this.expandedIndices = [menu.id];
				menu.selected = true;
			}
		})
	}

	ngAfterViewInit() {
		const currentUrl = this.location.path();
		this.sidebarMenu.forEach((menu: any) => {
			if (currentUrl == menu.path) {
				if (menu?.parentId) {
					this.drawer?.viewItems?.map((viewItem: any) => {
						if (viewItem.item.id === menu.parentId) {
							viewItem.item.cssClass = `${viewItem.item.cssClass || ''} expanded`;
						}
					});
				}
				menu.selected = true;
			}
		})
	}
}
