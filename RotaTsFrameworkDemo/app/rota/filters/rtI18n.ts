const i18NFilter = [
    'Localization', (localization: ILocalization) => {
        return (key: string) => localization.getLocal(key) || 'Resource (' + key + ')';
    }
];
//Register
angular.module('rota.filters.i18n', []).filter('i18n', i18NFilter);