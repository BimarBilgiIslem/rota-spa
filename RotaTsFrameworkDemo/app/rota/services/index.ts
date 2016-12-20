import "./logger.service"
import "./logger.exception"
import "./routing.service"
import "./dialogs.service"
import "./common.service"
import "./caching.service"
import "./localization.service"
import "./interceptors.service"
import "./titlebadges.service"
import "./security.service"
import "./validators.service"
import "./reporting.service"
import "./security.encoding.service"
//service module index
angular.module('rota.services',
    [
        'rota.services.log',
        'rota.services.common',
        'rota.services.dialog',
        'rota.services.httpRequestTracker',
        'rota.services.caching',
        'rota.services.localization',
        'rota.services.titlebadges',
        'rota.services.routing',
        'rota.services.security',
        'rota.services.validators',
        'rota.services.reporting',
        'rota.services.security.encoding'
    ]);


