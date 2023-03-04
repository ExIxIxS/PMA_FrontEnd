import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { AppControlService } from './services/app-control.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  public title: string = 'app-pma';

  constructor(
    private appControlService: AppControlService,
    private ref: ChangeDetectorRef,
  ) {}

  public ngOnInit() {
    this.appControlService.changeDetector = this.ref;
  }

}
