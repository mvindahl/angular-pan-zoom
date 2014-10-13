/* global describe */
/* global module */
/* global beforeEach */
/* global inject */
/* global it */
/* global expect */

describe('PanZoom specs', function () {
    var $scope = null;
    var $compile = null;
    var $interval = null;
    var PanZoomService = null;
    var deferred = null;

    // copied from jquery but makes it use the angular $interval instead of setInterval for its timer
    var timerId;
    jQuery.fx.start = function () {
        //console.log('jQuery.fx.start');
        if (!timerId) {
            timerId = $interval(jQuery.fx.tick, jQuery.fx.interval);
        }
    };
    jQuery.fx.stop = function () {
        //console.log('jQuery.fx.stop');
        $interval.cancel(timerId);
        timerId = null;
    };

    var shark = {
        x: 391,
        y: 371,
        width: 206,
        height: 136
    };
    var chopper = {
        x: 88,
        y: 213,
        width: 660,
        height: 144
    };
    var ladder = {
        x: 333,
        y: 325,
        width: 75,
        height: 200
    };
    var testApp = angular.module('testApp', ['panzoom', 'panzoomwidget']);

    beforeEach(module('testApp'));
    beforeEach(inject(function ($rootScope, _$compile_, _$interval_, _PanZoomService_, $q) {
        $scope = $rootScope;
        $compile = _$compile_;
        $interval = _$interval_;
        PanZoomService = _PanZoomService_;
        deferred = $q.defer();

        $scope.rects = [chopper, shark, ladder];

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

    it('should create markup', function () {
        var element = angular.element('<panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"></panzoom>');
        $compile(element)($scope);
        $scope.$digest();
        expect(element.html()).toMatch(/<div class="pan-zoom-contents".*<\/div>/);
    });

    it('should not zoom when using neutral zoom level', function () {
        $scope.panzoomConfig.neutralZoomLevel = 3;
        $scope.panzoomConfig.initialZoomLevel = 3;
        var element = angular.element('<panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"></panzoom>');
        $compile(element)($scope);
        $scope.$digest();

        expect($(element).find('.pan-zoom-contents').css('-webkit-transform')).toBe('scale(1)');

        $scope.panzoomConfig.neutralZoomLevel = 5;
        $scope.panzoomConfig.initialZoomLevel = 5;
        element = angular.element('<panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"></panzoom>');
        $compile(element)($scope);
        $scope.$digest();

        expect($(element).find('.pan-zoom-contents').css('-webkit-transform')).toBe('scale(1)');
    });

    it('should unregister its tick listener when directive is removed from page', function () {
        var element = angular.element('<div ng-if="includeDirective"><panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"></panzoom></div>');
        $compile(element)($scope);
        $scope.includeDirective = true;
        $scope.$digest();

        $scope.includeDirective = false;
        $scope.$digest();
        $interval.flush(jQuery.fx.interval); // need to wait for timer to to unregister the timer

        expect(timerId).toBe(null); // i.e. the native tick loop has stopped
    });

    it('should publish and unpublish its API', function () {
        var _this = this;

        var element = angular.element('<div ng-if="includeDirective"><panzoom id="PanZoomElementId" config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"></panzoom></div>');
        $compile(element)($scope);
        $scope.includeDirective = true;
        $scope.$digest();

        var handler = jasmine.createSpy('success');
        PanZoomService.getAPI('PanZoomElementId').then(handler);
        $scope.$digest();
        expect(handler).toHaveBeenCalled();

        $scope.includeDirective = false;
        $scope.$digest();
        PanZoomService.getAPI('PanZoomElementId').then(function (api) {
            _this.fail(Error('Failed to unregister API'));
        });
    });
});