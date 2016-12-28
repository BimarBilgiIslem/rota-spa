Rota CRUD SPA framework
=======
**Rota** , [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) uygulama geliştirme amacıyla yazılmış,angular ve bootstrap tabanlı bir [SPA](https://en.wikipedia.org/wiki/Single-page_application) framework'üdür. 

> [Demo uygulama kodları](https://github.com/BimarBilgiIslem/rota-spa-demo) |  [Canlı Intranet Edukkan uygulaması](http://edukkan.bimar.com)

###Geliştirme ortamı 
Visual Studio 2015,[TypeScript](http://www.typescriptlang.org/) kullanılarak geliştirilmiştir.Module loader olarak [RequireJS](requirejs.org),optimizasyon process için [r.js](http://requirejs.org/docs/optimization.html) kullanılmıştır

###Gereksinimler

 - Visual Studio 2015 U3 veya üstü
 - [TypeScript 2.0.6](http://download.microsoft.com/download/6/D/8/6D8381B0-03C1-4BD2-AE65-30FF0A4C62DA/TS2.0.6-TS-release20-nightly-20161015.1/TypeScript_Dev14Full.exe) veya üstü
 - [Web Compiler](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.WebCompiler) (SASS dosyalarını derlemek için)

###Kurulum
Rota framework'ü nuget'ten uygulamanıza ekleyebilirsiniz

    Install-Package rota.spa

Rota,uygulama root dizini altında **app** klasörü içine eklenecektir. *(~/app/rota)*
Nuget kurulumu bittikten sonra,app klasörü altına **startup.ts** dosyasını eklemeliyiz.Bu dosya,uygulama bootstrap oldugunda ilk çalışacak dosya'dır.

Dosya içerigi,kısaca aşagidaki gibi olmali.

    //this line is important
    import { App } from "rota/config/app";
    
    //config phase of angular pipeline
    App.configure(() => {
    
    });
    
    //run phase of angular pipeline
    App.run(() => {
    });

Artık uygulamamızı çalıştırabilirsiniz.


----------


Hızlı uygulama açmak ve rota item'ları (item templates) oluşturmak için [sidewaffle](http://sidewaffle.com/) ile oluşturulmuş vs extension kurulum dosyasını [buradan](https://github.com/BimarBilgiIslem/rota-spa/blob/master/rota-tmpl.vsix) indirebilirsiniz.Proje template'i rota.spa nuget paketinin yanında authentication,owin,webapi,signalR gibi server tarafı için gerekli olan nuget paketlerinide içermektedir.

Kurulumu yaptıktan sonra,new project template'lerine Rota SPA App uygulaması gelicektir. 
*Path : Visual C#/Web/Rota Web Apps/Rota SPA App*

![enter image description here](https://dl.dropboxusercontent.com/u/31471810/new-project.PNG)

Yeni Rota SPA App açtıktan sonra tüm nuget'leri restore ediyoruz ve böylece kod geliştirmeye hazır boş bir MVC uygulaması elde etmiş oluyoruz

![enter image description here](https://dl.dropboxusercontent.com/u/31471810/rota-items.PNG)

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
 - [Moment.js](momentjs.com)
 - [Spin.js](http://spin.js.org/)
 - [Angular Bootstrap](angular-ui.github.io/bootstrap/)
 - [jQuery](https://jquery.com/) 
 - [jQuery-SignalR](https://github.com/SignalR/SignalR/wiki/SignalR-JS-Client)
 - [Bootstrap 3x](http://getbootstrap.com/)

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

###Optimizasyon (Bundling & minification)
Optimizasyon için [node.js](https://nodejs.org/en/) tabanlı [r.js](http://requirejs.org/docs/optimization.html) kütüphane'sini kullanıyoruz.Optimisazyon sonucu tüm production dosyaları **dist** klasörüne çıkartılacaktır.
Javascript dosyalarını optimize etmek için :

    ({
        baseUrl: "../app",
        mainConfigFile: "../app/rota/config/main.js",
        dir: "../dist",
        preserveLicenseComments: false,
        locale: "tr-tr",
        optimize: "uglify2",
        uglify2: {
            mangle: false
        },	
        onBuildWrite: function (name, path, contents) {		
            //Olusan config dosyasindali baseUrl yi dist olarak değiştiriyoruz
            if (name === 'rota/config/main') {
                contents = contents.replace('app', 'dist');
            }
    
            return contents;
        },
        paths: {
            "signalr.hubs": "empty:"
        },
        removeCombined: true,
    	writeBuildTxt:true,
        modules: [           
            {
                name: "config/vendor.index"
            },
            //Rota Infrastructure
            {
                name: "startup",
                exclude: ["config/vendor.index"]              
            }            
        ]
    })
    
**Development dosyaları *app* klasörünün altındayken production dosyaları *dist* klasörünün altına kopyalanacaktir.**

Css dosyaları için :

    ({
        cssIn: '../Content/css/site.css',
        out: '../Content/css/index.min.css',
        optimizeCss: 'default'
    })

