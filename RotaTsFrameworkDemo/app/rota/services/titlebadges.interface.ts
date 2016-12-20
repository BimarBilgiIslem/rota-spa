/**
 * Badge Types
 */
const enum BadgeTypes {
    Editmode,
    Newmode,
    Recordcount,
    Selectedcount,
    Cloning,
    Dirty,
    Invalid,
    AutoSaving,
    Readonly
}

/**
 * Title badge
 */
interface ITitleBadge {
    /**
     * Title color - success,info,warning,danger
     */
    color: string;
    /**
     * Fontawesome icon
     */
    icon?: string;
    /**
     * Tooltip info
     */
    tooltip?: string;
    /**
     * Text information of badge
     */
    description?: string;
    /**
     * Flag that set visibility
     */
    show?: boolean;
}
/**
 * Title badges
 */
interface ITitleBadges extends IBaseService {
    /**
     * Badges
     */
    badges: { [index: number]: ITitleBadge };
    /**
     * Clear badges
     * @returns {} 
     */
    clearBadges(): void;
}
