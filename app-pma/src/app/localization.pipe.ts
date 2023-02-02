import { Pipe, PipeTransform } from '@angular/core';
import { LocalStorageService } from './localStorage.service';
import { localizationLibrary } from './localizationLibrary';

@Pipe({
  name: 'localization'
})
export class LocalizationPipe implements PipeTransform {
  constructor(private localStorageService: LocalStorageService) {}

  transform(value: string, ...args: unknown[]): unknown {
    const currentLanguage = this.localStorageService.currentLanguage;
    const contentType = (args.length) ? 'articles' : 'strings';
    const localizedValue = localizationLibrary[currentLanguage][contentType][value];

    return (localizedValue) ? localizedValue : value;
  }

}
