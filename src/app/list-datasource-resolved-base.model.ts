import { _isNumberValue } from '@angular/cdk/coercion';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, EMPTY, from, Observable, Subject, timer } from 'rxjs';
import {
  concatMap,
  filter,
  map,
  mergeAll,
  take,
  takeUntil,
  takeWhile,
} from 'rxjs/operators';
import { SearchTerms } from './search';
import { MAX_SAFE_INTEGER } from './utils.model';
import { removeTags } from './utils.service';

export abstract class ListDataSourceResolvedBase<
  TEntity
> extends DataSource<TEntity> {
  dataStream$: BehaviorSubject<TEntity[]>;
  noFilteredEntities$: BehaviorSubject<number>;
  noEntities$: BehaviorSubject<number>;
  loading = false;
  private _sort = new BehaviorSubject<MatSort | null>(null);
  private _paginator = new BehaviorSubject<MatPaginator | null>(null);
  private _subscriptionsStopper = new Subject<void>();

  constructor(
    public searchTerms$: BehaviorSubject<string | null> = new BehaviorSubject<
      string | null
    >(null),
    initialData: TEntity[] | null = null,
    private _options: { caseSensitive: boolean } = { caseSensitive: true }
  ) {
    super();
    this.dataStream$ = new BehaviorSubject<TEntity[]>(initialData ?? []);
    this.noFilteredEntities$ = new BehaviorSubject<number>(
      this.dataStream$.getValue().length
    );
    this.noEntities$ = new BehaviorSubject<number>(
      this.dataStream$.getValue().length
    );
  }

  setData(data: TEntity[]): void {
    this.noFilteredEntities$.next(data.length);
    this.dataStream$.next(data);
  }

  setPaginator(paginator?: MatPaginator | null): void {
    if (!paginator) return;
    this._paginator.next(paginator);
  }

  setSort(sort?: MatSort | null): void {
    if (!sort) return;
    this._sort.next(sort);
  }

  addData(data: TEntity[]): void {
    this.dataStream$.next(this.dataStream$.getValue().concat(data));
    this.noFilteredEntities$.next(this.dataStream$.getValue().length);
  }

  connect(): Observable<TEntity[]> {
    this._paginator
      .pipe(
        filter((p: MatPaginator | null) => !!p),
        take(1)
      )
      .subscribe(() => {
        this.searchTerms$.next(this.searchTerms$.getValue());
      });

    return from([
      this.dataStream$,
      this._paginator.pipe(
        concatMap((p: MatPaginator | null) => p?.page ?? EMPTY)
      ),
      this._sort.pipe(concatMap((s: MatSort | null) => s?.sortChange ?? EMPTY)),
      this.searchTerms$,
    ]).pipe(
      mergeAll(),
      map(() => {
        const value = this.dataStream$.getValue();
        const filteredData = this._getSortedData(
          this._getSearchedData(value?.length ? [...value] : [])
        );
        this._setPaginatorLength(filteredData.length);
        this.noEntities$.next(value?.length ?? 0);
        this.noFilteredEntities$.next(filteredData.length);
        return this._getPagedData(filteredData);
      }),

      takeUntil(this._subscriptionsStopper)
    );
  }

  disconnect(): void {
    this._subscriptionsStopper.next();
    this._subscriptionsStopper.complete();
    this.dataStream$.complete();
    this.noFilteredEntities$.complete();
  }

  /**
   * Gets a sorted copy of the data array based on the state of the MatSort. Called
   * after changes are made to the filtered data or when sort changes are emitted from MatSort.
   * By default, the function retrieves the active sort and its direction and compares data
   * by retrieving data using the sortDataAccessor. May be overridden for a custom implementation
   * of data ordering.
   *
   * Implementation from https://github.com/angular/components/blob/master/src/material/table/table-data-source.ts
   *
   * @param data The array of data that should be sorted.
   * @param sort The connected MatSort that holds the current sort state.
   */
  sortCompare: (
    sort: MatSort
  ) => (entityA: TEntity, entityB: TEntity) => number = (sort: MatSort) => {
    const active = sort.active;
    const direction = sort.direction;
    if (!active || direction === '') {
      return (_a: TEntity, _b: TEntity): number => 0;
    }

    return (a: TEntity, b: TEntity): number => {
      let valueA = this.sortDataAccessor(a, active);
      let valueB = this.sortDataAccessor(b, active);

      const valueAType = typeof valueA;
      const valueBType = typeof valueB;

      if (valueAType !== valueBType) {
        if (valueAType === 'number') {
          valueA += '';
        }
        if (valueBType === 'number') {
          valueB += '';
        }
      }

      let comparatorResult = 0;
      if (valueA != null && valueB != null) {
        if (valueA > valueB) {
          comparatorResult = 1;
        } else if (valueA < valueB) {
          comparatorResult = -1;
        }
      } else if (valueA != null) {
        comparatorResult = 1;
      } else if (valueB != null) {
        comparatorResult = -1;
      }

      return comparatorResult * (direction === 'asc' ? 1 : -1);
    };
  };

  /**
   * Returns the data for the sortHeaderId in the entity
   *
   * @param entity Entity to get the value
   * @param sortHeaderId Header Id
   */
  sortDataAccessor: (data: TEntity, sortHeaderId: string) => string | number = (
    entity: TEntity,
    sortHeaderId: string
  ): string | number => {
    const value = (entity as { [key: string]: any })[sortHeaderId];
    if (!_isNumberValue(value)) {
      return value;
    }
    const numberValue = Number(value);
    return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
  };

  /**
   * For custom search override this property
   * Checks if a data object matches the data source's filter string. By default, each data object
   * is converted to a string of its properties and returns true if the filter has
   * at least one occurrence in that string. By default, the filter string has its whitespace
   * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
   * filter matching.
   *
   * Implementation from https://github.com/angular/components/blob/master/src/material/table/table-data-source.ts
   *
   * @param data Data object used to check against the filter.
   * @param filter Filter string that has been set on the data source.
   * @returns Whether the filter matches against the data
   */
  filterPredicate: (data: TEntity, searchTerms: string[]) => boolean = (
    data: TEntity,
    searchTerms: string[]
  ): boolean => {
    const emptyObjectStr = {}.toString();
    let dataStr = Object.keys(data as any).reduce(
      (currentTerm: string, key: string) => {
        const term = this.filterDataAccessor(data, key as keyof TEntity);
        return term && !term.includes(emptyObjectStr)
          ? currentTerm + term + '◬'
          : currentTerm;
      },
      ''
    );
    if (!this._options.caseSensitive) {
      dataStr = dataStr.toLowerCase();
    }
    this.filterCustomTerms(data);
    return searchTerms.some((tf: string) => dataStr.indexOf(tf) !== -1);
  };

  filterDataAccessor: (data: TEntity, propName: keyof TEntity) => string = (
    data: TEntity,
    prop: keyof TEntity
  ): string =>
    removeTags(
      Array.isArray(data[prop])
        ? (data[prop] as unknown as any[]).map(this._stringValRep).join('◬')
        : this._stringValRep(data[prop])
    );

  filterCustomTerms: (data: TEntity) => string = () => '';

  protected _getSearchedData(data: TEntity[]): TEntity[] {
    const searchTerms = this.searchTerms$?.getValue();
    if (!searchTerms?.length) {
      return data;
    }

    return data.filter((entity: TEntity) =>
      this.filterPredicate(
        entity,
        searchTerms
          .split(' ')
          .map((st) => (this._options.caseSensitive ? st : st.toLowerCase()))
      )
    );
  }

  protected _getPagedData(data: TEntity[]): TEntity[] {
    if (!this._paginator.getValue()!) {
      return data;
    }
    const startIndex =
      this._paginator.getValue()!.pageIndex *
      this._paginator.getValue()!.pageSize;
    return data.splice(startIndex, this._paginator.getValue()!.pageSize);
  }

  protected _getSortedData(data: TEntity[]): TEntity[] {
    const sort = this._sort.getValue();
    if (!sort?.active || sort.direction === '') {
      return data;
    }
    return data.sort(this.sortCompare(sort));
  }

  private _stringValRep(
    v: number | boolean | string | null | undefined | any
  ): string {
    if (!v) {
      return '';
    }
    switch (typeof v) {
      case 'number':
      case 'boolean':
        return (v as unknown as number | boolean).toString();
      case 'object':
        return Object.values(v).join('◬');
      default:
        return v;
    }
  }

  private _setPaginatorLength(length: number): void {
    if (!this._paginator.getValue() || !length) return;
    timer(0).subscribe(() => (this._paginator.getValue()!.length = length));
  }
}

export class ListDataSourceResolved<
  TEntity
> extends ListDataSourceResolvedBase<TEntity> {}
