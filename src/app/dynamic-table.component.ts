import { TitleCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { concatMap, filter, map, takeUntil } from 'rxjs/operators';
import { BaseUnsubscribeComponent } from './base-unsubscribe-component.model';
import { ListDataSourceResolved } from './list-datasource-resolved-base.model';
import { SearchTerms } from './search';
import { StartlizePipe } from './start-case.pipe';
import { UtilsService } from './utils.service';
import '../polyfills/string.extension';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

export type DynamicTableLabels = {
  searchPlaceHolder?: string;
  emptyDataMsg?: string;
  emptyFilterMsg?: string;
};

@Component({
  selector: 'app-shared-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
})
export class DynamicTableComponent<T = any>
  extends BaseUnsubscribeComponent
  implements OnInit, AfterViewInit
{
  @HostBinding('class.jd-dynamic-table') dynamicTable = true;

  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  @ViewChild('search', { static: true })
  searchInput!: ElementRef<HTMLInputElement>;
  @Input() data?: { [key: string]: any }[];
  @Input() data$!: Observable<{ [key: string]: T }[]>;
  @Input() ignoredProps: string[] = [];
  @Input() order: string[] = [];
  @Input() transform?: (key: string, value: any) => string;
  @Input() searchEnabled = true;
  /**
   * Max number of property object allowed to display as a table.
   * Otherwise will be displays as key-value pair object
   */
  @Input() maxPropArrayView = 6;
  /**
   * Enable pass the search into inner generated tables
   */
  @Input() enableOuterSearch = true;
  @Input() outerSearchItem?: Observable<SearchTerms | null>;

  columns!: string[];
  dataSource!: ListDataSourceResolved<{ [key: string]: any }>;
  searchTerms = new BehaviorSubject<SearchTerms | null>(null);

  internalToPropObjectTableDef = DynamicTableComponent.toPropObjectTableDef;

  private _labels!: DynamicTableLabels;

  get labels(): DynamicTableLabels {
    if (!this._labels) {
      this.labels = null as any;
    }
    return this._labels;
  }

  @Input() set labels(lk: DynamicTableLabels) {
    this._labels = {
      searchPlaceHolder: 'Search',
      emptyDataMsg: 'Empty data',
      emptyFilterMsg: 'Filter returned not data for',
    };
  }

  static toPropObjectTableDef<T, TKey extends keyof T>(
    r: T,
    propName: string,
    ignoredProps: TKey[] = [],
    transformValue: ((k: TKey, value: T[TKey]) => string) | null = null,
    transformKey: ((keyValue: keyof T) => string) | null = null
  ): { [propertyName: string]: string | null | undefined }[] {
    const tsp = new TitleCasePipe();
    const sp = new StartlizePipe();
    const defTransKey = (keyValue: keyof T): string =>
      tsp.transform(sp.transform(keyValue as string)!);

    return Object.keys(r as any)
      .filter((k) => ignoredProps.every((v) => v !== k))
      .map(
        (k: string) =>
          ({
            [propName]: `<strong>${(transformKey ?? defTransKey)(
              k as keyof T
            )}</strong>`,
            [' ']: !transformValue
              ? r[k as keyof T]
              : transformValue(k as TKey, r[k as TKey]),
          } as { [propertyName: string]: string | null | undefined })
      );
  }

  ngOnInit(): void {
    if (!this.data && !this.data$) {
      throw new Error('Either data or data$ must be passed.');
    }

    if (this.data && this.data$) {
      throw new Error('Only one of data or data$ must be passed.');
    }

    this.dataSource = new ListDataSourceResolved(this.searchTerms);
    this.data$ = of(this.data!);

    this._init();
  }

  ngAfterViewInit(): void {
    this.dataSource.setSort(this.sort);
    this.dataSource.setPaginator(this.paginator);

    if (!this.outerSearchItem) {
      return;
    }

    this.outerSearchItem
      .pipe(
        concatMap((v: SearchTerms | null) => {
          this.searchInput.nativeElement.value = v?.global ?? '';
          this.onSearchTerm(this.searchInput.nativeElement.value);

          return timer(100).pipe(map(() => v));
        }),
        filter(
          (v: SearchTerms | null) =>
            !!v?.global && !this.dataSource.noFilteredEntities$.getValue()
        ),
        takeUntil(this._stop$)
      )
      .subscribe(() => {
        this.searchInput.nativeElement.value = '';
        this.onSearchTerm('');
      });
  }

  onSearchTerm(searchTerm: string): void {
    this.searchTerms.next(
      new SearchTerms({
        global: searchTerm,
        specifics: {},
      })
    );
  }

  isArray(elm: any): boolean {
    return Array.isArray(elm);
  }

  isObject(elm: any): boolean {
    return typeof elm === 'object' && elm !== null && !this.isArray(elm);
  }

  isDate(elm: Date | any): boolean {
    return typeof elm === 'object' && elm instanceof Date;
  }

  displayAsItemsTable(elm: any[]): boolean {
    return elm[0] && Object.keys(elm[0]).length <= this.maxPropArrayView;
  }

  isNativeArray(elm: any[]): boolean {
    if (!elm[0]) {
      return false;
    }
    const typeOfFirstElm = typeof elm[0];
    return (
      typeOfFirstElm === 'string' ||
      typeOfFirstElm === 'boolean' ||
      typeOfFirstElm === 'number'
    );
  }

  private _init(): void {
    this.data$.subscribe((data: { [key: string]: any }[]) => {
      const tempData = data.map((item: { [key: string]: any }) => {
        const objectPropsProcessed = this._getObjectKeyValuePairs({
          input: item,
          ignoredProps: this.ignoredProps,
          order: this.order,
          transform: this.transform,
        });
        const res: { [key: string]: any } = {};
        objectPropsProcessed.forEach((i: { title: string; value: string }) => {
          res[i.title] = i.value;
        });
        return res;
      });

      this.dataSource.setData(tempData);
      this.columns = tempData.length ? Object.keys(tempData[0]) : [];
    });
  }

  private _getObjectKeyValuePairs(options: {
    input: { [key: string]: any };
    ignoredProps?: string[];
    order?: string[];
    transform?: (key: string, value: any) => string;
  }): { title: string; value: string }[] {
    const items: { title: string; value: string }[] = [];

    const addItem = (
      key: string,
      arr: { title: string; value: string }[]
    ): void => {
      arr.push({
        title: key,
        value: !options.transform
          ? options.input[key]
          : options.transform(key, options.input[key]),
      });
    };

    const unOrderedItems: { title: string; value: string }[] = [];
    for (const key in options.input) {
      if (
        Object.prototype.hasOwnProperty.call(options.input, key) &&
        (!options.ignoredProps ||
          !options.ignoredProps.some((ip) => ip === key))
      ) {
        addItem(
          key,
          !options.order || options.order.some((k) => k === key)
            ? items
            : unOrderedItems
        );
      }
    }

    return !options.order
      ? items
      : items
          .sort(
            (a, b) =>
              options.order!.indexOf(a.title) - options.order!.indexOf(b.title)
          )
          .concat(unOrderedItems);
  }
}
