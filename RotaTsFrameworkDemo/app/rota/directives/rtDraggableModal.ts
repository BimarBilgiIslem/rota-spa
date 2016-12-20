//#region draggableModal 
//http://stackoverflow.com/a/36201892/1016147
function draggableModalDirective() {
    function link($scope: ng.IScope, element: ng.IAugmentedJQuery): void {
        var draggableStr = "draggableModal";
        var header = $(".modal-header", element);

        header.on('mousedown', (mouseDownEvent) => {
            var modalDialog = element;
            var offset = header.offset();

            modalDialog.addClass(draggableStr).parents().on('mousemove', (mouseMoveEvent) => {
                $("." + draggableStr, modalDialog.parents()).offset({
                    top: mouseMoveEvent.pageY - (mouseDownEvent.pageY - offset.top),
                    left: mouseMoveEvent.pageX - (mouseDownEvent.pageX - offset.left)
                });
            }).on('mouseup', () => {
                modalDialog.removeClass(draggableStr);
            });
        });
    }

    //#region Directive Definition
    const directive = <ng.IDirective>{
        restrict: 'AC',
        link: link
    };
    return directive;
    //#endregion
}
//#endregion

//#region Register
angular.module('rota.directives.rtdraggablemodal', [])
    .directive('modalDialog', draggableModalDirective);
//NOTE:modalDialog is class name of uib-modal itself
//#endregion
export { draggableModalDirective }