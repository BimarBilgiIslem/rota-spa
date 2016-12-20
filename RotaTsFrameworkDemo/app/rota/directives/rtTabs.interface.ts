//#region Interfaces
/**
 * Tab interface
 */
interface ITab {
    index?: number;
    heading?: string;
    icon?: string;
    state: string;
    tabViewName?: string;
    params?: any;
    disable?: boolean;
    active?: boolean;
    activeState?: string;
    badge?: string;
    badgeType?: string;
}
//#endregion