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
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { concatMap, filter, map, takeUntil } from 'rxjs/operators';
import '../polyfills/string.extension';
import { BaseUnsubscribeComponent } from './base-unsubscribe-component.model';
import {
  ListDataSourceResolved,
  SearchTerm,
} from './list-datasource-resolved-base.model';
import { StartlizePipe } from './start-case.pipe';

export type DynamicTableLabels = {
  searchPlaceHolder?: string;
  emptyDataMsg?: string;
  emptyFilterMsg?: string;
};

@Component({
  selector: 'jd-dynamic-table',
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
  @Input() data!: T[] | Observable<T[]>;
  @Input() ignoredProps: (keyof T)[] = [] as (keyof T)[];
  @Input() order: (keyof T)[] = [] as (keyof T)[];
  @Input() transform?: (key: keyof T, value: any) => string;
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
  @Input() caseSensitive = true;
  @Input() outerSearchItem?: Observable<SearchTerm>;
  @Input() itemsPerPage: number[] = [5, 10, 20];
  @Input() columSearchEnabled = true;

  loading = false;
  columns!: string[];
  dataSource!: ListDataSourceResolved<{ [key: string]: any }>;
  searchTerms = new BehaviorSubject<SearchTerm>(null);
  data$!: Observable<T[]>;

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
    if (!this.data) {
      throw new Error('Either data prop must be passed.');
    }

    this.dataSource = new ListDataSourceResolved(this.searchTerms, [] as any, {
      caseSensitive: this.caseSensitive,
    });
    this.data$ =
      this.data instanceof Observable
        ? this.data
        : (of(this.data!) as Observable<T[]>);

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
        concatMap((v: SearchTerm) => {
          this.searchInput.nativeElement.value = v?.global ?? '';
          this.onSearchTerm(this.searchInput.nativeElement.value);

          return timer(100).pipe(map(() => v));
        }),
        filter(
          (v: SearchTerm) =>
            !!v && !this.dataSource.noFilteredEntities$.getValue()
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
      !this.searchTerms.getValue()
        ? { global: searchTerm }
        : { ...this.searchTerms.getValue(), global: searchTerm }
    );
  }

  onColumnSearchTerm(colName: string, searchTerm: string): void {
    this.searchTerms.next(
      !this.searchTerms.getValue()
        ? ({ [colName]: searchTerm } as SearchTerm)
        : ({
            ...this.searchTerms.getValue(),
            [colName]: searchTerm,
          } as SearchTerm)
    );
  }

  joinTruthyStrings(...args: (string | null | undefined)[]) {
    return args?.filter((a) => !!a).join(' ');
  }

  getSearchTermsValue(): { [key: string]: string } {
    return this.searchTerms.getValue() ?? {};
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

  getMinItemsPerPage(): number {
    return this.itemsPerPage.sort()[0];
  }

  getSearchColumnsHeaderRowDef(): string[] {
    return this.columns?.map((c) => `search-column-${c}`) ?? [];
  }

  private _init(): void {
    this.loading = true;
    this.data$.subscribe((data: T[]) => {
      if (!Array.isArray(data))
        throw new Error('Dynamic table data must be an array.');

      this.columns = [];
      const columnsAdded: { [key: string]: true } = {};
      const tempData = data.map((item: T) => {
        const objectPropsProcessed = this._getObjectKeyValuePairs({
          input: item,
          ignoredProps: this.ignoredProps,
          order: this.order,
          transform: this.transform,
        });
        const res: { [key: string]: any } = {};
        objectPropsProcessed.forEach((i: { title: string; value: string }) => {
          res[i.title] = i.value;
          if (!columnsAdded[i.title]) {
            columnsAdded[i.title] = true;
            this.columns.push(i.title);
          }
        });
        return res;
      });

      this.dataSource.setData(tempData);
      this.loading = false;
    });
  }

  private _getObjectKeyValuePairs(options: {
    input: T;
    ignoredProps?: (keyof T)[];
    order?: (keyof T)[];
    transform?: (key: keyof T, value: T) => string;
  }): { title: string; value: string }[] {
    const items: { title: string; value: string }[] = [];

    const addItem = (
      key: keyof T,
      arr: { title: string; value: string }[]
    ): void => {
      arr.push({
        title: key as string,
        value: !options.transform
          ? (options.input[key] as unknown as string)
          : options.transform(key, options.input[key] as any),
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
              options.order!.indexOf(a.title as keyof T) -
              options.order!.indexOf(b.title as keyof T)
          )
          .concat(unOrderedItems);
  }
}
