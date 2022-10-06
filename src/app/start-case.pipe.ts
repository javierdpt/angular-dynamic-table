/**
 * @license
 * All Rights Reserved.
 *
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'startlize',
})
export class StartlizePipe implements PipeTransform {
  transform(str: string | undefined | null): string | undefined | null {
    return !str ? str : str.replace(/([A-Z]+)*([A-Z][a-z])/g, '$1 $2').trim();
  }
}
