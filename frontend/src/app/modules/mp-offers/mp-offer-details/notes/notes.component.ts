import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MPOffer } from 'src/app/models/mp-offer';
import { MpOfferService } from '../../services/mp-offer.service';

@Component({
	selector: 'app-notes',
	templateUrl: './notes.component.html',
	styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
	@Input() data!: MPOffer;
	
	public form:any;
	public offerNotes: any = [{}];

	constructor(private fb: FormBuilder, private mpOfferSrv: MpOfferService) {}

	ngOnInit() {
		this.addNewControls();
	}

	ngAfterViewInit(): void {
        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }

	addNewControls(): void {
		this.form = this.fb.group({
		   note:new FormControl()
		});
	}
}
