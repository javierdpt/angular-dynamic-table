import { Pipe, PipeTransform } from '@angular/core';
import { removeTags } from './utils.service';

@Pipe({
  name: 'highlightText',
})
export class HighlightTextPipe implements PipeTransform {
  transform(inputValue: string | any, lookForItems: string | any): string {
    if (
      !inputValue ||
      inputValue instanceof Object ||
      !lookForItems ||
      lookForItems instanceof Object
    ) {
      return inputValue;
    }

    const value = removeTags(inputValue.toString());

    let words: string[];
    try {
      words = lookForItems.split(' ');
    } catch (e) {
      words = [lookForItems.toString()];
    }

    words = words.filter((w) => !!w).sort((w1, w2) => w2.length - w1.length);

    const chunks: HighlightChunks[] = [
      { highlighted: false, value: value.toString() },
    ];
    for (let i = 0, length = words.length; i < length; ++i) {
      const lookFor = words[i];

      for (let j = 0, valLength = chunks.length; j < valLength; ++j) {
        const chunk = chunks[j];
        if (chunk.highlighted) {
          continue;
        }
        const searchIn = chunk.value.toLowerCase();
        const lookForLower = lookFor.toLowerCase();
        const lookForLength = lookFor.length;
        const indexes = searchIn.allIndexOf(lookForLower);

        if (indexes.length) {
          const tempChunks: HighlightChunks[] = [];
          tempChunks.push({
            value: chunk.value.substring(0, indexes[0]),
            highlighted: false,
          });
          for (
            let k = 0, indexesLength = indexes.length;
            k < indexesLength;
            ++k
          ) {
            const from = indexes[k];
            const to = from + lookForLength;
            const str = chunk.value.substring(from, from + lookForLength);

            tempChunks.push({
              value: str,
              highlighted: true,
            });

            const length2 =
              k + 1 !== indexes.length
                ? indexes[k + 1] - to
                : chunk.value.length - to;

            tempChunks.push({
              value: chunk.value.substring(to, to + length2),
              highlighted: false,
            });
          }

          chunks.splice(j, 1, ...tempChunks);
          valLength = chunks.length;
          j += tempChunks.length - 1;
        }
      }
    }
    return this._join(chunks);
  }

  protected _join(valToJoin: HighlightChunks[]): string {
    let res = '';
    valToJoin.forEach((item) => {
      if (item.highlighted) {
        res += '<span class="highlighted">' + item.value + '</span>';
      } else {
        res += item.value;
      }
    });
    return res;
  }
}

class HighlightChunks {
  value!: string;
  highlighted!: boolean;
}
