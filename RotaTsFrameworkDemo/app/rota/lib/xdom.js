define("xdom", [], {
    normalize: function (name, normalize) {
        //remove cachebust 
        var baseUrl = window.require.toUrl('.').split("?")[0],
        parts = name.split('/'),
        xdom = parts[0],
        xdomUrl = xdom + '/' + baseUrl + parts.slice(1).join('/');
        return normalize(xdomUrl);
    },
    load: function (moduleName, parentRequire, onload, config) {
        if (config.isBuild) {
            onload();
        } else {
            parentRequire([moduleName], function (value) {
                onload(value);
            });
        }
    }
});