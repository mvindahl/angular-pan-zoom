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
    var $document = null;

    // copied from jquery but makes it use the angular $interval instead of setInterval for its timer
    var timerId = null;
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

    // copied from jQuery but makes it possible to pretend to be in the future
    var now = 0;
    jQuery.now = function () {
        return now;
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
    beforeEach(inject(function ($rootScope, _$compile_, _$interval_, _PanZoomService_, $q, _$document_) {
        $scope = $rootScope;
        $compile = _$compile_;
        $interval = _$interval_;
        PanZoomService = _PanZoomService_;
        deferred = $q.defer();
        $document = _$document_;

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
        expect(element.html()).toMatch(/<div.*<\/div>/);
    });

    it('should not zoom when using neutral zoom level', function () {
        $scope.panzoomConfig.neutralZoomLevel = 3;
        $scope.panzoomConfig.initialZoomLevel = 3;
        var element = angular.element('<panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"></panzoom>');
        $compile(element)($scope);
        $scope.$digest();

        expect($(element).find('.zoom-element').css('-webkit-transform')).toBe('scale(1)');

        $scope.panzoomConfig.neutralZoomLevel = 5;
        $scope.panzoomConfig.initialZoomLevel = 5;
        element = angular.element('<panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"></panzoom>');
        $compile(element)($scope);
        $scope.$digest();

        expect($(element).find('.zoom-element').css('-webkit-transform')).toBe('scale(1)');
    });

    it('Should pan when the mouse is dragged', function () {
    	var element = angular.element('<panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"><div id="WrappedElement"/></panzoom>');
        $compile(element)($scope);
        $scope.$digest();

        var overlay = $document.find('#PanZoomOverlay');
        
        function createMouseEvent(type, clientX, clientY) {
            var e = document.createEvent('MouseEvents');
            // type, canBubble, cancelable, view,  detail, screenX, screenY, clientX, clientY,  ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget
            e.initMouseEvent(type, true, true, window, 1, 0, 0, clientX || 0, clientY || 0, false, false, false, false, 0, null);
            e.preventDefault = undefined;
            e.stopPropagation = undefined;
            
            return e;
        }

        element.find('#WrappedElement').trigger(createMouseEvent('mousedown', 100, 100));

        expect($scope.panzoomModel.pan).toEqual({
            x: 0,
            y: 0
        });

        now += 40; // pretend that time passed
        overlay.trigger(createMouseEvent('mousemove', 110, 100));

        expect($scope.panzoomModel.pan).toEqual({
            x: 10,
            y: 0
        });

        overlay.trigger(createMouseEvent('mouseup', 120, 120));

        for (var i = 0; i < 10; i++) {
            $interval.flush(jQuery.fx.interval);
            now += jQuery.fx.interval;
        }

        expect($scope.panzoomModel.pan.x).toBeGreaterThan(10); // due to sliding effects; specific value doesn't matter
        expect($scope.panzoomModel.pan.y).toEqual(0);
    });

    it('should pan when dragging the finger (touch)', function () {
    	var element = angular.element('<panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"><div id="WrappedElement"/></panzoom>');
        $compile(element)($scope);
        $scope.$digest();

        var overlay = $document.find('#PanZoomOverlay');
        
        function createTouchEvent(type, touches) {
            var e = document.createEvent('MouseEvents');
            // type, canBubble, cancelable, view,  detail, screenX, screenY, clientX, clientY,  ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget
            e.initMouseEvent(type, true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            e.touches = touches || [];
            
            e.preventDefault = undefined;
            e.stopPropagation = undefined;
            
            return $.event.fix(e);
        }

        element.find('#WrappedElement').trigger(createTouchEvent('touchstart', [{pageX: 100, pageY: 100}]));

        expect($scope.panzoomModel.pan).toEqual({
            x: 0,
            y: 0
        });

        now += 40; // pretend that time passed
        overlay.trigger(createTouchEvent('touchmove', [{pageX: 110, pageY: 100}]));

        expect($scope.panzoomModel.pan).toEqual({
            x: 10,
            y: 0
        });

        overlay.trigger(createTouchEvent('touchend'));

        for (var i = 0; i < 10; i++) {
            $interval.flush(jQuery.fx.interval);
            now += jQuery.fx.interval;
        }

        expect($scope.panzoomModel.pan.x).toBeGreaterThan(10); // due to sliding effects; specific value doesn't matter
        expect($scope.panzoomModel.pan.y).toEqual(0);
    });

    it('should use {{interpolated}} value for panzoomid', function () {
        var element = angular.element('<panzoom id="{{panZoomElementId}}" config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"><div id="WrappedElement"/></panzoom>');

        $scope.panZoomElementId = "panZoom1";

        $compile(element)($scope);

        var handler = jasmine.createSpy('success');
        PanZoomService.getAPI('panZoom1').then(handler);

        $scope.$digest();

        expect(handler).toHaveBeenCalled();
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
