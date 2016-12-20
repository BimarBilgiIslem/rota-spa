const crudListFilter = ['$filter', ($filter: ng.IFilterService) => {
    return (list: IBaseCrudModel[]) => {
        return $filter('filter')(list, item => {
            return item.modelState !== ModelStates.Deleted && item.modelState !== ModelStates.Detached;
        });
    }
}];
//Register
angular.module('rota.filters.crudlist', []).filter('crudlist', crudListFilter);