describe('PanZoom specs', function() {
	var $scope = null;
	var compile = null;
	var shark = { x : 391, y: 371, width: 206, height: 136 };
	var chopper = { x : 88, y: 213, width: 660, height: 144 };
	var ladder = { x : 333, y: 325, width: 75, height: 200 };
	var testApp = angular.module('testApp', ['panzoom', 'panzoomwidget']);

	beforeEach(module('testApp'))
	beforeEach(inject(function($rootScope, $compile) {
		$scope = $rootScope;
		compile = $compile;
		element = angular.element('<panzoom config="panzoomConfig" model="panzoomModel" style="width:800px; height: 600px"></panzoom>');

		$scope.rects = [ chopper, shark, ladder ];

		// Instantiate models which will be passed to <panzoom> and <panzoomwidget>

		// The panzoom config model can be used to override default configuration values
		$scope.panzoomConfig = {
			zoomLevels: 12,
			neutralZoomLevel: 5,
			scalePerZoomLevel: 1.5,
			initialZoomToFit: shark
		};

		// The panzoom model should initialle be empty; it is initialized by the <panzoom>
		// directive. It can be used to read the current state of pan and zoom. Also, it will
		// contain methods for manipulating this state.
		$scope.panzoomModel = {};

	}));

	it('directive should work', function() {
		compile(element)($scope);
		$scope.$digest();
		expect(element.html()).toBe('<div class="pan-zoom-contents" style="position: absolute; -webkit-transform-origin-x: 0px; -webkit-transform-origin-y: 0px; -webkit-transform: scale(3.2789803458800524); left: -1219.8162908647457px; top: -1139.472371841343px; " ng-transclude=""></div>');
	});

	it('directive should work diffently with neutral zoom level of 1', function() {
		$scope.panzoomConfig.neutralZoomLevel = 1;
		compile(element)($scope);
		$scope.$digest();
		var zoomContent = element.children()
		expect(zoomContent.css('left')).toBe('-1356.6450419689784px');
		expect(zoomContent.css('-webkit-transform')).toBe('scale(3.5559616234189844)');
	});

	it('directive should work diffently with neutral zoom level of 3', function() {
		$scope.panzoomConfig.neutralZoomLevel = 3;
		compile(element)($scope);
		$scope.$digest();
		var zoomContent = element.children()
		expect(zoomContent.css('left')).toBe('-1286.8438742954654px');
		expect(zoomContent.css('top')).toBe('-1199.037370072286px');
		expect(zoomContent.css('-webkit-transform')).toBe('scale(3.4146637131487156)');
	});
});