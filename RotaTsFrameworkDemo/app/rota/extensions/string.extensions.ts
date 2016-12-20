import * as _ from "underscore"

String.prototype.isNullOrEmpty = function (): boolean {
    return this === null || this.length === 0;
}


