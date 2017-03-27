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

//#region TitleBadge Service
/**
 * TitleBadge Service
 */
class TitleBadges implements ITitleBadges {
    //#region Props
    serviceName = "TitleBadges Service";
    badges: { [index: number]: ITitleBadge };
    //#endregion

    //#region Init
    static $inject = ['Localization'];
    constructor(private localization: ILocalization) {
        this.initBadges();
    }
    /**
     * Create all badges
     */
    private initBadges(): void {
        this.badges = {};

        this.badges[BadgeTypes.Editmode] = {
            color: 'info',
            icon: 'edit',
            description: this.localization.getLocal('rota.kayitduzeltme')
        };

        this.badges[BadgeTypes.Newmode] = {
            color: 'info',
            icon: 'plus',
            description: this.localization.getLocal('rota.yeni')
        };
        this.badges[BadgeTypes.Cloning] = {
            color: 'danger',
            icon: 'copy',
            description: this.localization.getLocal('rota.kopyalaniyor')
        };
        this.badges[BadgeTypes.Invalid] = {
            color: 'danger',
            icon: 'exclamation',
            description: this.localization.getLocal('rota.zorunlualanlarvar')
        };

        this.badges[BadgeTypes.Dirty] = {
            color: 'success',
            icon: 'pencil',
            description: this.localization.getLocal('rota.duzeltiliyor'),
            hiddenDescOnMobile: true
        };

        this.badges[BadgeTypes.Recordcount] = {
            color: 'success',
            icon: 'reorder',
            description: this.localization.getLocal('rota.kayitsayisi') + " 0"
        };
        this.badges[BadgeTypes.Selectedcount] = {
            color: 'danger',
            icon: 'check'
        };
        this.badges[BadgeTypes.AutoSaving] = {
            color: 'success',
            icon: 'floppy-o',
            description: this.localization.getLocal('rota.otomatikkayitediliyor')
        };
        this.badges[BadgeTypes.Readonly] = {
            color: 'warning',
            icon: 'eye',
            description: this.localization.getLocal('rota.sadeceokuma')
        };
    }
    //#endregion

    //#region Methods
    /**
     * Hide all badges 
     */
    clearBadges(): void {
        for (let i = BadgeTypes.Editmode; i <= BadgeTypes.Readonly; i++) {
            this.badges[i].show = false;
        }
    }

    //#endregion
}

//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.titlebadges', []);
module.service('TitleBadges', TitleBadges);
//#endregion

export { TitleBadges }