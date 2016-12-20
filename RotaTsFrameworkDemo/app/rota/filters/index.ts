import "./rtI18n"
import "./rtCrudList"
import "./rtTextCase"
import "./rtHtmltoPlainText"

angular.module('rota.filters',
    [
        'rota.filters.i18n',
        'rota.filters.crudlist',
        'rota.filters.textcase',
        'rota.filters.htmltoplaintext'
    ]);
