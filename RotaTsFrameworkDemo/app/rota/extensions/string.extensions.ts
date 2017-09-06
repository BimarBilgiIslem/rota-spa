/*
 * Copyright 2017 Bimar Bilgi İşlem A.Ş.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as _ from "underscore"
import * as s from "underscore.string";

declare global {
    interface String {
        /**
         * Check if string value is not null or empty
         * @returns {boolean} 
         */
        isNullOrEmpty?: () => boolean;
        /**
        * Checks if string starts with another string.
        * ('image.gif', 'image') => true
        * @param str
        * @param starts
        */
        startsWith?: (starts: string) => boolean;
        /**
         * Tests if string contains a substring.
         * ('foobar', 'ob') => true
         * @param str
         * @param needle
         */
        contains(needle: string): boolean;
        /**
         * Convert the provided string value to all lowercase text depending on the locale
         * @returns {string} 
         */
        turkishToLower(): string;
        /**
         * Convert the provided string value to all uppercase text depending on the locale
         * @returns {string} 
         */
        turkishToUpper(): string;
    }
}

String.prototype.isNullOrEmpty = function (): boolean {
    return this === null || this.length === 0;
}

String.prototype.startsWith = function (starts: string): boolean {
    return s.startsWith(this, starts);
}

String.prototype.contains = function (needle: string): boolean {
    return s.contains(this, needle);
}

String.prototype.turkishToLower = function (): string {
    var string = this;
    var letters = { "İ": "i", "I": "ı", "Ş": "ş", "Ğ": "ğ", "Ü": "ü", "Ö": "ö", "Ç": "ç" };
    string = string.replace(/(([İIŞĞÜÇÖ]))/g, function (letter) { return letters[letter]; })
    return string.toLowerCase();
}

String.prototype.turkishToUpper = function (): string {
    var string = this;
    var letters = { "i": "İ", "ş": "Ş", "ğ": "Ğ", "ü": "Ü", "ö": "Ö", "ç": "Ç", "ı": "I" };
    string = string.replace(/(([iışğüçö]))/g, function (letter) { return letters[letter]; })
    return string.toUpperCase();
}
