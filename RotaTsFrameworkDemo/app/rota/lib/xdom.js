define("xdom", [], {
    normalize: function (name, normalize) {
        var baseUrl = window.require.toUrl('.'),
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