/*global angular:false */
/*global setInterval:false */

angular.module('panzoomwidget', [])
.directive('panzoomwidget', function() {
	return {
		restrict: 'E',
		transclude: false,
		scope: {
			config: '=',
			model: '='
		},
		controller: function($scope, $element) {
//			console.log('init panzoomwidget.js');

			var zoomSliderWidget = $element.find('.zoom-slider-widget');

			$scope.getZoomLevels = function() {
				var zoomLevels = [];
				for (var i = 0; i < $scope.config.zoomLevels; i++) {
					zoomLevels.push(i);
				}
				return zoomLevels;
			};

			$scope.widgetConfig = {
				zoomLevelHeight : 10
			};

			$scope.zoomIn = function() {
				$scope.model.zoomIn();
			};

			$scope.zoomOut = function() {
				$scope.model.zoomOut();
			};

			// $watch is not fast enough so we set up our own polling
			setInterval(function() {
				zoomSliderWidget.css('top', (($scope.config.zoomLevels - $scope.model.zoomLevel - 1) * $scope.widgetConfig.zoomLevelHeight) + 'px');
			}, 25);
		},
		template:
			'<div class="panzoomwidget">' +
				'<div ng-click="zoomIn()" class="zoom-button zoom-button-in">+</div>' +
				'<div class="zoom-slider">' +
					'<div class="zoom-slider-widget" style="height:{{widgetConfig.zoomLevelHeight - 2}}px"></div>' +
					'<div ng-repeat="zoomLevel in getZoomLevels()" class="zoom-level zoom-level-{{zoomLevel}}" ' +
						'style="height:{{widgetConfig.zoomLevelHeight - 2}}px"></div>' +
				'</div>' +
				'<div ng-click="zoomOut()" class="zoom-button zoom-button-out">-</div>' +
			'</div>',
		replace: true
	};
});
