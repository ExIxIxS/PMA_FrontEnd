import { Component } from '@angular/core';
import { AppControlService } from 'src/app/services/app-control.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(
    private appControlService: AppControlService,
  ) {}

  public get isSmallScreen(): boolean {
    return this.appControlService.isSmallScreen;
  }

}
