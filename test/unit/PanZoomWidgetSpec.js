/* global describe */
/* global module */
/* global beforeEach */
/* global inject */
/* global it */
/* global expect */

describe('PanZoomWidget specs', function () {
    var $scope = null;
    var $compile = null;
    var $interval = null;
    var PanZoomService = null;
    var $q = null;

    var testApp = angular.module('testApp', ['panzoom', 'panzoomwidget']);

    beforeEach(module('testApp'));
    beforeEach(inject(function ($rootScope, _$compile_, _$interval_, _PanZoomService_, _$q_) {
        $scope = $rootScope;
        $compile = _$compile_;
        $interval = _$interval_;
        PanZoomService = _PanZoomService_;
        $q = _$q_;

        // Instantiate models which will be passed to <panzoom> and <panzoomwidget>

        // The panzoom config model can be used to override default configuration values
        $scope.panzoomConfig = {
            zoomLevels: 10,
            neutralZoomLevel: 5,
            scalePerZoomLevel: 1.5
        };

        // The panzoom model should initially be empty; it is initialized by the <panzoom>
        // directive. It can be used to read the current state of pan and zoom. Also, it will
        // contain methods for manipulating this state.
        $scope.panzoomModel = {};

    }));

    afterEach(function () {
        $scope.$broadcast('$destroy');
        $interval.flush(jQuery.fx.interval); // wait for the first event tick to complete as this will do the actual unregistering
    });

    it('should instantiate', function () {
        var element = angular.element('<panzoomwidget panzoom-id="PanZoomElementId"></panzoomwidget>');
        var deferredAPI = $q.defer();
        deferredAPI.resolve({
            config: $scope.panzoomConfig,
            model: $scope.panzoomModel
        });
        spyOn(PanZoomService, 'getAPI').andReturn(deferredAPI.promise);

        $compile(element)($scope);
        $scope.$digest();
    });
});