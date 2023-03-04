import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'userOutput' })
export class OutputPipe implements PipeTransform {
  public transform(value: any, ...args: any[]) {
    const limit: number = (args.length)
      ? args[0]
      : 20;

    return this.refactorForOutput(value, limit);

  }

  public refactorForOutput(str: string, lengthLimit: number): string {
    return str
      .split(' ')
      .map((word) => this.spaceWithLimit(word, lengthLimit))
      .join(' ');

  }

  private spaceWithLimit(str: string, lengthLimit: number): string {
    const spacedArr = [];
    let subStr = '';
    if (str.length > lengthLimit) {
      for (let strIndex = 0, subStrLength = 0; strIndex < str.length; strIndex++) {
        subStr += str[strIndex];
        subStrLength++;
        if ((strIndex === str.length - 1) || subStrLength === lengthLimit) {
          spacedArr.push(subStr);
          subStr = '';
          subStrLength = 0;
        }
      }
      return spacedArr.join(' ');
    } else {
      return str;
    }

  }

}
