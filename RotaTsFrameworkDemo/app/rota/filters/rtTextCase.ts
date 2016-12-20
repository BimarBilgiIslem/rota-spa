import * as s from "underscore.string";
const filter = () => {
    return (value: string, type: "uppercase" | "title" | "lowercase" | "capitalize"): string => {
        if (!value) return value;

        let result = value;
        switch (type) {
            case "uppercase":
                result = value.toLocaleUpperCase();
                break;
            case "title":
                result = s.titleize(value);
                break;
            case "lowercase":
                result = value.toLocaleLowerCase();
                break;
            case "capitalize":
                result = s.capitalize(value);
                break;
        }
        return result;
    }
};
//Register
angular.module('rota.filters.textcase', []).filter('textcase', filter);