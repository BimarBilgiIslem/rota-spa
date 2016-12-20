Rota CRUD SPA framework
=======
**Rota** , [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) uygulama geliştirme amacıyla yazılmış,angular ve bootstrap tabanlı bir [SPA](https://en.wikipedia.org/wiki/Single-page_application) framework'üdür. 

###Geliştirme ortamı 
Visual Studio 2015 U3,[TypeScript](http://www.typescriptlang.org/) 2.0.6 kullanılarak geliştirilmiştir.Module loader olarak [RequireJS](requirejs.org),optimizasyon process için [r.js](http://requirejs.org/docs/optimization.html) kullanılmıştır

###Gereksinimler

 - Visual Studio 2015 U3 veya üstü
 - [TypeScript 2.0.6](http://download.microsoft.com/download/6/D/8/6D8381B0-03C1-4BD2-AE65-30FF0A4C62DA/TS2.0.6-TS-release20-nightly-20161015.1/TypeScript_Dev14Full.exe) veya üstü
 - [Web Compiler](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.WebCompiler) (SASS dosyalarını derlemek için)

###Kurulum
Rota framework'ü nuget'ten uygulamanıza ekleyebilirsiniz

    Install-Package rota.spa

Rota,uygulama root dizini altında **app** klasörü içine eklenecektir. *(~/app/rota)*

Hızlı uygulama açmak ve rota item'ları oluşturmak için [sidewaffle](http://sidewaffle.com/) ile oluşturulmuş vs extension kurulum dosyasını [buradan](https://github.com/BimarBilgiIslem/rota-spa/blob/master/rota-tmpl.vsix) indirebilirsiniz.Proje template'i rota.spa nuget paketinin yanında authentication,owin,webapi,signalR gibi server tarafı için gerekli olan nuget paketlerinide içermektedir.

Kurulumu yaptıktan sonra,new project template'lerine Rota SPA App uygulaması gelicektir. 
*Path : Visual C#/Web/Rota Web Apps/Rota SPA App*

Yeni Rota SPA App açtıktan sonra tüm nuget'leri restore ediyoruz ve böylece kod geliştirmeye hazır boş bir MVC uygulaması elde etmiş oluyoruz

Bu extension ile rota project template'lerini projeye ekleyebilirsiniz*Visual C#/Web/Rota SPA Client Templates* altında 

 - BaseApi
 - BaseController
 - BaseCrudApi
 - BaseCrudController
 - BaseFormController
 - BaseListController
 - BaseModalController
 - BaseModelController
 - Directive
 - Filter
 - Modal Template

item'larını ekleyebilirsiniz.

###Kullanılan open source directive'ler
 - [ui-select](https://github.com/angular-ui/ui-select)
 - [ui-grid](https://github.com/angular-ui/ui-grid)
 - [ui-router](https://ui-router.github.io/)
 - [ui.router.extras.sticky](https://github.com/christopherthielen/ui-router-extras)
 - [du-scroll](https://github.com/oblador/angular-scroll)
 - [ui.bootstrap.datetimepicker](https://github.com/dalelotts/angular-bootstrap-datetimepicker)
 - [hotkeys](https://github.com/chieffancypants/angular-hotkeys/)
 - [ng-currency](https://github.com/aguirrel/ng-currency)
 - [ngImgCrop](https://github.com/alexk111/ngImgCrop)
 - [angular-svg-round-progressbar](https://github.com/crisbeto/angular-svg-round-progressbar)
 - [ng.ckeditor](https://github.com/miamarti/ng.ckeditor)
 - [ngContextMenu](https://github.com/Wildhoney/ngContextMenu)
 - [ivh.treeview](https://github.com/iVantage/angular-ivh-treeview)

Tüm vendor directive bilgilerine [buradan](https://github.com/BimarBilgiIslem/rota-spa/blob/master/RotaTsFrameworkDemo/app/rota/lib/index.ts) erişebilirsiniz

###Styling

Rota style framework'ü,[Bootstrap 3X SASS](https://github.com/twbs/bootstrap-sass) kütüphanesini kullanıyor.Rota'nin ihtiyaci olan tüm style dosyaları Content dosyası altında bulunuyor.Proje bazında stil yaratmak için 
*/Content/scss/* klasörü altında yeni klasör yaratarak kendi SASS dosyalarınızı burada yaratabilirsiniz.

    //proje bazlı variables dosyası
    @import "variables";
    //rota sass dosyaları 
    @import "../rota/rota";
    //proje bazlı SASS dosyaları
    @import "components/input_groups";
    @import "components/dropdown";
    ...
    

###Yetkilendirme

Authentication için [OpenID Connect(OIDC)](http://openid.net/) desteklemektedir..Net implementasyonu için [Identity Server 3](https://github.com/IdentityServer/IdentityServer3) kullanmaktadır.Client kodu için [security servisine](https://github.com/BimarBilgiIslem/rota-spa/blob/master/RotaTsFrameworkDemo/app/rota/services/security.service.ts) bakabilirsiniz
