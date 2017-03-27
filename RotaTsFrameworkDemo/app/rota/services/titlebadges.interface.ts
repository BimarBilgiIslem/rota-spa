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
     * Hide description part of badge on small devices
     */
    hiddenDescOnMobile?: boolean;
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
