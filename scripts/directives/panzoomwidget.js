angular.module('panzoomwidget', [])
.directive('panzoomwidget', function() {
	return {
		restrict: 'E',
		transclude: false,
		scope: {
			config: '=',
			model: '='
		},
		controller: ['$scope', '$element', function($scope, $element) {
			var zoomSliderWidget = $element.find('.zoom-slider-widget');
			var isDragging = false;

			$scope.getZoomLevels = function() {
				var zoomLevels = [];
				for (var i = $scope.config.zoomLevels - 1; i >= 0; i--) {
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

			$scope.zoomToLevel = function(level) {
				$scope.model.changeZoomLevel(level);
			};

			$scope.onMousedown = function() {
				isDragging = true;
			};

			$scope.zoomToLevelIfDragging = function(zoomLevel) {
				if (isDragging) {
					$scope.model.changeZoomLevel(zoomLevel);
				}
			};

			$scope.onMouseup = function() {
				isDragging = false;
			};

			$scope.onMouseleave = function() {
				isDragging = false;
			};

			// $watch is not fast enough so we set up our own polling
			setInterval(function() {
				zoomSliderWidget.css('top', (($scope.config.zoomLevels - $scope.model.zoomLevel - 1) * $scope.widgetConfig.zoomLevelHeight) + 'px');
			}, 25);
		}],
		template:
			'<div class="panzoomwidget" ng-mouseleave="onMouseleave()">' +
				'<div ng-click="zoomIn()" ng-mouseenter="zoomToLevelIfDragging(config.zoomLevels - 1)" class="zoom-button zoom-button-in">+</div>' +
				'<div class="zoom-slider" ng-mousedown="onMousedown()" ng-mouseup="onMouseup()">' +
					'<div class="zoom-slider-widget" style="height:{{widgetConfig.zoomLevelHeight - 2}}px"></div>' +
					'<div ng-repeat="zoomLevel in getZoomLevels()" ng-mouseenter="zoomToLevelIfDragging(zoomLevel)" ng-click="zoomToLevel(zoomLevel)"' +
					' class="zoom-level zoom-level-{{zoomLevel}}" style="height:{{widgetConfig.zoomLevelHeight - 2}}px"></div>' +
				'</div>' +
				'<div ng-click="zoomOut()" ng-mouseenter="zoomToLevelIfDragging(0)" class="zoom-button zoom-button-out">-</div>' +
			'</div>',
		replace: true
	};
});
