/* eslint-disable */

/**
 * https://www.c-sharpcorner.com/article/learn-about-extension-methods-in-typescript/
 * import './extension-method/extension-method.component'
 * number: Number;
 * result: String;
 * this.number = 123456789;
 * this.result = this.number.thousandsSeparator();
 */

 interface String {
    // trimLeft(): string;
    // trimRight(): string;
    // replaceAll(search: string, replacement: string): string;
    allIndexOf(search: string): number[];
    contains(search: string): boolean;
    removeTags(): string;
    capitalize(): string;
}

if (!String.prototype.hasOwnProperty('allIndexOf')) {
    String.prototype.allIndexOf = function (search: string): number[] {
        let i = -1;
        const indexes: number[] = [];
        while ((i = this.indexOf(search, i === -1 ? 0 : (i + search.length))) !== -1) {
            indexes.push(i);
        }
        return indexes;
    };
}

if (!String.prototype.hasOwnProperty('contains')) {
    String.prototype.contains = function (search: string): boolean {
        return this.indexOf(search) !== -1;
    };
}

String.prototype.removeTags = function (): string {
    return this.replace(/(<([^>]+)>)/ig, '');
}

String.prototype.capitalize = function (): string {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// if (!String.prototype.hasOwnProperty('replaceAll')) {
//     String.prototype.replaceAll = function (search, replacement): string {
//         return this.replace(new RegExp(search, 'g'), replacement);
//     };
// }

// if (!String.prototype.hasOwnProperty('trimLeft')) {
//     String.prototype.trimLeft = function (): string {
//         if (this == null) {
//             return this;
//         }
//         return this.replace(/^\s+|\s+$/g, '');
//     };
// }

// if (!String.prototype.hasOwnProperty('trimRight')) {
//     String.prototype.trimRight = function (): string {
//         if (this == null) {
//             return this;
//         }
//         return this.replace(/\s+$/g, '');
//     };
// }