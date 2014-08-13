angular.module('panzoom').factory('PanZoomService', ['$q',
    function ($q) {
        // key -> deferred with promise of API
        var panZoomAPIs = {};

        var registerAPI = function (key, panZoomAPI) {
            if (!panZoomAPIs[key]) {
                panZoomAPIs[key] = $q.defer();
            }

            var deferred = panZoomAPIs[key];
            if (deferred.hasBeenResolved) {
                throw "Internal error: attempt to register a panzoom API but key was already used. Did you declare two <panzoom> directives with the same id?";
            } else {
                deferred.resolve(panZoomAPI);
                deferred.hasBeenResolved = true;
            }
        };

        // this method returns a promise since it's entirely possible that it's called before the <panzoom> directive registered the API
        var getAPI = function (key) {
            if (!panZoomAPIs[key]) {
                panZoomAPIs[key] = $q.defer();
            }

            return panZoomAPIs[key].promise;
        };

        return {
            registerAPI: registerAPI,
            getAPI: getAPI
        };
}]);