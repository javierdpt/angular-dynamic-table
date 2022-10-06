import { OnDestroy, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export abstract class BaseUnsubscribeComponent implements OnDestroy {
    protected _stop$ = new Subject<void>();

    ngOnDestroy(): void {
        this._stop$.next(void 0);
        this._stop$.complete();
    }
}
