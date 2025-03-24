import { Component, Input } from '@angular/core';
import { GenericTagType } from './generic-tag-type';

@Component({
  selector: 'app-generic-tag',
  templateUrl: './generic-tag.component.html',
  styleUrl: './generic-tag.component.css'
})
export class GenericTagComponent {
  public genericTagType = GenericTagType;
  @Input() type: GenericTagType = GenericTagType.Success;
  public isHovered = false;

  constructor(){}

  onHover(){
    this.isHovered = true;
  }
  
  onHoverOff(){
    this.isHovered = false;
  }

}

export { GenericTagType };

