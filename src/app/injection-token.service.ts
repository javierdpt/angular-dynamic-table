import { InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('Window object ref injection token', {
    providedIn: 'root',
    factory: (): Window => window
});

export const DOC = new InjectionToken<Document>('Doc object ref injection token', {
    providedIn: 'root',
    factory: (): Document => document
});

export const CONSOLE = new InjectionToken<Console>('Console object ref injection token', {
    providedIn: 'root',
    factory: (): Console => console
});