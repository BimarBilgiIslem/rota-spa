const htmlToPlainText = () => {
    return function (text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
};
//Register
angular.module('rota.filters.htmltoplaintext', []).filter('htmltoplaintext', htmlToPlainText);

