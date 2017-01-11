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

Nuget kurulumu bittikten sonra,`app` klasörü altına **startup.ts** dosyasını eklemelisiniz.

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

> **ÖNEMLİ** : :bulb:  Rota'nın module resolution tipi [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) oldugundan ts.config dosyasında veya proje'nin properties ayarlarında AMD olarak set etmelisiniz

Sonraki adım olarak uygulamanıza menü eklemelisiniz.Menü eklemek için [Routing servisi](https://github.com/BimarBilgiIslem/rota-spa/wiki/Service%27ler#routing) `addMenus` methodu kullanılmalı.

    //run phase of angular pipeline
        App.run(["Routing",(routing:IRouting) => {
	        routing.addMenus([...]);
        }]);

Son olarak [Global Environments](https://github.com/BimarBilgiIslem/rota-spa/wiki/Global-Environments) sayfasındaki *Index sayfasi* ve *Global settings* ayarlarını yaptıktan sonra

Artık uygulamanızı çalıştırabilirsiniz. :rocket:


----------
###Styling
Uygulamayı ilk çalıştırdığınızda herhangi bir CSS dosyası yüklenmez.Varsayilan CSS dosyasi oluşturmaniz icin `rota.scss` dosyasini derlemeniz gerekir.Oluşan CSS dosyasıda `Content/css` folder'nda olmalı.Ayrıntılı bilgi için [Styling](https://github.com/BimarBilgiIslem/rota-spa/wiki/Styling) sayfasına bakabilirsiniz


###Project Item Templates & Code Snippets

Hızli uygulama geliştirmek amacıyla Rota project ve item template'leri içeren VS extension'i [buradan](https://github.com/BimarBilgiIslem/rota-spa/wiki/Project-Item-Templates-&-Code-Snippets) indirebilirsiniz.Ayrıntılı bilgi için [Project Item Templates](https://github.com/BimarBilgiIslem/rota-spa/wiki/Project-Item-Templates) sayfasına göz atabilirsiniz

Ayrıca rota directive ve custom HTML layout ları için [rota code snippet's](https://github.com/BimarBilgiIslem/rota-spa/blob/master/rota-snippets.vsix) extension'i kurabilirsiniz

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
 - [ui-mask](https://github.com/angular-ui/ui-mask)

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


----------


###License

MIT License

Copyright (c) 2017 Bimar Bilgi İşlem A.Ş.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

