Rota CRUD SPA framework
=======
**Rota** , [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) uygulama geliştirme amacıyla yazılmış,angular ve bootstrap tabanlı bir [SPA](https://en.wikipedia.org/wiki/Single-page_application) framework'üdür. 

> [Demo uygulama kodları](https://github.com/BimarBilgiIslem/rota-spa-demo) |  [Canlı Intranet Edukkan uygulaması](http://edukkan.bimar.com) | [Wiki](https://github.com/BimarBilgiIslem/rota-spa/wiki) 

###Geliştirme ortamı 
Visual Studio 2015,[TypeScript](http://www.typescriptlang.org/) kullanılarak geliştirilmiştir.Module loader olarak [RequireJS](requirejs.org),optimizasyon process için [r.js](http://requirejs.org/docs/optimization.html) kullanılmıştır

###Gereksinimler

 - Visual Studio 2015 U3 veya üstü
 - [TypeScript 2.0.6](http://download.microsoft.com/download/6/D/8/6D8381B0-03C1-4BD2-AE65-30FF0A4C62DA/TS2.0.6-TS-release20-nightly-20161015.1/TypeScript_Dev14Full.exe) veya üstü
 - [Web Compiler](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.WebCompiler) (SASS dosyalarını derlemek için)

###Kurulum
Boş MVC uygulamasına Rota framework'ü nuget'ten uygulamanıza ekleyebilirsiniz

    Install-Package rota.spa

Rota ts dosyaları,uygulama root dizini altında **app** klasörüne,SCSS dosyaları ise **Content** klasörü altına eklenecektir

Nuget kurulumu bittikten sonra,`app` klasörü altına **startup.ts** dosyasını eklemeliyiz.

> **Bu dosya,uygulama bootstrap oldugunda ilk çalışacak dosya'dır.** Başlangıç ayarları bu dosyada yapılmalıdır.(*Menü ekleme,dinamik resources vs...*)

`startup.ts` dosya içerigi,minimal aşagidaki gibi olmali.*İlk line framewok'ü yükleyecektir.*

    //this line is important
    import { App } from "rota/config/app";
    
    //config phase of angular pipeline
    App.configure(() => {
    
    });
    
    //run phase of angular pipeline
    App.run(() => {
    });

> **ÖNEMLİ** :  Rota'nın module resolution tipi [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) oldugundan ts.config dosyasında veya proje'nin properties ayarlarında AMD olarak set etmelisiniz

Sonraki adım olarak uygulamanıza menü eklemelisiniz.Menü eklemek için [Routing servisi](https://github.com/BimarBilgiIslem/rota-spa/wiki/Service%27ler#routing) `addMenus` methodu kullanılmalı.

    //run phase of angular pipeline
        App.run(["Routing",(routing:IRouting) => {
	        routing.addMenus([...]);
        }]);

Artık uygulamamızı çalıştırabilirsiniz. :rocket:


----------
###Styling
Uygulamayı ilk çalıştırdığınızda herhangi bir CSS dosyayi yüklenmez.Varsayilan CSS dosyasi oluşturmaniz icin `rota.scss` dosyasini derlemeniz gerekir.Oluşan CSS dosyasıda `Content/css` folder'nda olmalı.Ayrıntılı bilgi için [Styling](https://github.com/BimarBilgiIslem/rota-spa/wiki/Styling) sayfasına bakabilirsiniz


###Project & Item Templates

Hızli uygulama geliştirmek amacıyla Rota project ve item template'leri içeren VS extension'i [buradan](https://github.com/BimarBilgiIslem/rota-spa/blob/master/rota-tmpl.vsix) indirebilirsiniz.Ayrıntılı bilgi için [Project Item Templates](https://github.com/BimarBilgiIslem/rota-spa/wiki/Project-Item-Templates) sayfasına göz atabilirsiniz

###Yetkilendirme

Authentication için [OpenID Connect(OIDC)](http://openid.net/) desteklemektedir..Net implementasyonu için [Identity Server 3](https://github.com/IdentityServer/IdentityServer3) kullanmaktadır.Ayrıntılı bilgi için [security servisine](https://github.com/BimarBilgiIslem/rota-spa/wiki/Service%27ler#security) göz atabilirsiniz.




###Kullanılan open source directive'ler ve kütüphaneler
####Directives
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
####Kütüphaneler
 - [Underscore](underscorejs.org)
 - [Underscore.string](https://github.com/epeli/underscore.string)
 - [Moment.js](momentjs.com)
 - [Spin.js](http://spin.js.org/)
 - [Angular Bootstrap](angular-ui.github.io/bootstrap/)
 - [jQuery](https://jquery.com/) 
 - [jQuery-SignalR](https://github.com/SignalR/SignalR/wiki/SignalR-JS-Client)
 - [Bootstrap 3x](http://getbootstrap.com/)

Tüm vendor directive bilgilerine [buradan](https://github.com/BimarBilgiIslem/rota-spa/blob/master/RotaTsFrameworkDemo/app/rota/lib/index.ts) erişebilirsiniz
