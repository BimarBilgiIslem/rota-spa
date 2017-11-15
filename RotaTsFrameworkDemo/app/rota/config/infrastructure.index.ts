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

import "./config"
import "../base/index"
import "../services/index"
import "../directives/index"
import "../filters/index"
import "../extensions/index"
//shell controllers
import "../shell/shell.controller"
import "../shell/profile.controller"
import "../shell/templates"

angular.module('rota', [
    'rota.constants',
    'rota.config',
    'rota.services',
    'rota.directives',
    'rota.filters',
    'rota.shell',
    'rota.shell.profile',
    'rota.shell.templates',
    /*lib & core loaded in vendor.index*/
    'rota.lib',
    'rota.core'
]);
