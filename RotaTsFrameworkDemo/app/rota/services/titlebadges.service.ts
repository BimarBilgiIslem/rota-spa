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
            description: this.localization.getLocal('rota.yenikayit')
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
            description: this.localization.getLocal('rota.duzeltiliyor')
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