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

import * as s from "underscore.string";

//#region Interfaces
interface IAvatarScope extends ng.IScope {
    userId?: number;
    size?: "small" | "medium" | "large";
}
//#endregion

//#region Directive
function avatarDirective($compile: ng.ICompileService, $http: ng.IHttpService,
    currentUser: IUser, securtyconfig: ISecurityConfig, common: ICommon, constants: IConstants) {

    function link(scope: IAvatarScope, element: ng.IAugmentedJQuery): void {
        const avatarFallBack = (): string => {
            if (securtyconfig.useFirstLetterAvatar) {
                const firstLetters = currentUser.fullname.split(' ').map(value => value[0]).join('');
                return `<div ng-class="[\'avatar-firstletter\', \'avatar-\'+size]">${firstLetters}</div>`;
            }
            const fullName = s.titleize(currentUser.fullname);
            return `<span class="avatar-fullname"><i class="fa fa-user"></i> ${fullName}</span>`;
        }

        const compile = (content: string | JQuery) => {
            element.append(content);
            $compile(element.contents())(scope);
        }

        scope.size = scope.size || "medium";

        if (!angular.isDefined(scope.userId)) {
            if (currentUser.avatarDataUri) {
                compile(`<img class="img-circle" ng-class="[\'img-circle\', \'avatar-\'+size]" ng-src="${currentUser.avatarDataUri}" alt="user avatar" />`);
            } else {
                compile(avatarFallBack());
            }
        } else {
            if (securtyconfig.avatarProviderUri) {
                //load img with preimage
                const defaultAvatarPath = `${common.addTrailingSlash(constants.style.IMG_BASE_PATH) +
                    constants.style.DEFAULT_AVATAR_NAME.replace('{size}', scope.size)}`;
                const imgElem = $(`<img ng-class="[\'img-circle\', \'avatar-\'+size]" src="${defaultAvatarPath}" alt="user avatar" />`);
                compile(imgElem);
                /**
                * Update src 
                * @param src
                */
                const updateSrc = (src: string) => {
                    $(imgElem).fadeOut(350,
                        () => {
                            $(imgElem).attr('src', src).fadeIn(350);
                        });
                }
                //get avatar from remote service
                //cefdwqdwq
                const context = {
                    username: currentUser.name.replace('.', '_'),
                    userid: currentUser.id,
                    size: scope.size,
                    shortsize: scope.size.charAt(0)
                }
                const uri = common.format(securtyconfig.avatarProviderUri, context);
                //Get img depending on fetch type
                //this is a must for uris which run with NTLM authentication or apis
                switch (securtyconfig.avatarFetchType) {
                case AvatarFetchType.GetRequest:
                    const avatarProm = $http.get<string>(encodeURI(uri), <any>{ showSpinner: false });
                    avatarProm.then(response => {
                        if (!common.isNullOrEmpty(response.data)) {
                            //replace src attr of img elem
                            updateSrc(response.data);
                        }
                    });
                    break;
                case AvatarFetchType.ImgSrc:
                    updateSrc(uri);
                    break;
                default:
                }
            } else {
                compile(avatarFallBack());
            }
        }
    }
    const directive = <ng.IDirective>{
        restrict: 'AE',
        link: link,
        scope: {
            userId: '=',
            size: '@'
        }
    };
    return directive;
}
avatarDirective.$inject = ['$compile', '$http', 'CurrentUser', 'SecurityConfig', 'Common', 'Constants'];
//#endregion

//#region Register
angular.module('rota.directives.rtavatar', [])
    .directive('rtAvatar', avatarDirective);
//#endregion

export { avatarDirective }