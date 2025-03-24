import { Component } from '@angular/core';

@Component({
	selector: 'app-loader',
	template: `
		<div class="k-i-loading"></div>
  	`,
	styles: [
		`
			.k-i-loading {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				font-size: 64px;
				background-color: rgba(255, 255, 255, 0.3);
				color: #005981;
				z-index: 999999;
			}

    	`
	]
})
export class LoaderComponent {

}
