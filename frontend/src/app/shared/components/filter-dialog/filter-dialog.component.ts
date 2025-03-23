import {
    Component,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
@Component({
    selector: 'app-filter-dialog',
    templateUrl: './filter-dialog.component.html',
    styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent {
    public searchValue: string = ''
    public toggleButton: boolean = false
    @Input() currentItem: any;
    @Input() buttonText?: string;
    @Input() isWindowLoaderEnabled: boolean = false;
    @Input() settings!: { title: string, width: string, height: string, showButton:boolean };
    @Output() closeEventEmiter = new EventEmitter<any>()
    @Output() selectEventEmiter = new EventEmitter<any>()
    @Output() buttonEvent = new EventEmitter<any>()
    @Input() columns!: Array<{ field: string, name: string }>;
    @Input() items: [] = [];

    close() {
        this.closeEventEmiter.emit(false)
    }
   
    selectItem(item: any) {
        this.currentItem = item;
    }
    confirmCheck() {
        this.selectEventEmiter.emit(this.currentItem);
        this.close();
    }
    
    buttonEventClick() {
        this.toggleButton = !this.toggleButton
        this.buttonText = this.toggleButton ? $localize`With 0 Stock` :   $localize`Without 0 Stock`
        this.buttonEvent.emit(this.toggleButton);
    }


}
