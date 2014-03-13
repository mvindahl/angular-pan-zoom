describe('PanZoom specs', function() {
	var $scope = null;
	var shark = { x : 391, y: 371, width: 206, height: 136 };
	var chopper = { x : 88, y: 213, width: 660, height: 144 };
	var ladder = { x : 333, y: 325, width: 75, height: 200 };
	var testApp = angular.module('testApp', ['panzoom', 'panzoomwidget']);

	beforeEach(module('testApp'))
	beforeEach(inject(function($rootScope, $compile) {
		$scope = $rootScope;
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

		$compile(element)($scope);
	}));

	it('directive should work', function() {
		$scope.$digest();
		expect(element.html()).toBe('<div class="pan-zoom-contents" style="position: absolute; -webkit-transform-origin-x: 0px; -webkit-transform-origin-y: 0px; -webkit-transform: scale(3.2789803458800524); left: -1219.8162908647457px; top: -1139.472371841343px; " ng-transclude=""></div>');
	});
});