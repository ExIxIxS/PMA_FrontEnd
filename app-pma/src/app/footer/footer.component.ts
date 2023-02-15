import { Component } from '@angular/core';
import { AppControlService } from '../app-control.service';

@Component({
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(
    private appControlService: AppControlService,
  ) {}

  get isSmallScreen() {
    return this.appControlService.isSmallScreen;
  }
}
