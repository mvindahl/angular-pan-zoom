describe('PanZoom specs', function () {
    var $scope = null;
    var compile = null;
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

    var panzoomHtml = '<panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"></panzoom>';

    beforeEach(module('testApp'))
    beforeEach(inject(function ($rootScope, $compile) {
        $scope = $rootScope;
        compile = $compile;

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

    it('should create markup', function () {
        var element = angular.element(panzoomHtml);
        compile(element)($scope);
        $scope.$digest();
        expect(element.html()).toMatch(/<div class="pan-zoom-contents".*<\/div>/);
    });

    it('should not zoom when using neutral zoom level', function () {
        $scope.panzoomConfig.neutralZoomLevel = 3;
        $scope.panzoomConfig.initialZoomLevel = 3;
        var element = angular.element(panzoomHtml);
        compile(element)($scope);
        $scope.$digest();

        expect($(element).find('.pan-zoom-contents').css('-webkit-transform')).toBe('scale(1)');

        $scope.panzoomConfig.neutralZoomLevel = 5;
        $scope.panzoomConfig.initialZoomLevel = 5;
        element = angular.element(panzoomHtml);
        compile(element)($scope);
        $scope.$digest();

        expect($(element).find('.pan-zoom-contents').css('-webkit-transform')).toBe('scale(1)');
    });
});