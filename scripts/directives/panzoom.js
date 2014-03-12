/*!
 AngularJS pan/zoom v0.1-snapshot
 (c) 2014 Martin Vindahl Olsen
 License: MIT
 Github: https://github.com/mvindahl/angular-pan-zoom
*/

//FIXME we should stop spelling out the full path in the model at all times when declaring a local variable would improve readbility.
//Also, we should see how to facilitate minification. Probably some of the same things.

angular.module('panzoom', ['monospaced.mousewheel'])
.directive('panzoom', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			config: '=',
			model: '='
		},
		controller: ['$scope', '$element', function($scope, $element) {
			// initialize models. Use passed properties when available, otherwise revert to defaults
			// NOTE: all times specified in seconds, all distances specified in pixels

			$scope.config.zoomLevels = $scope.config.zoomLevels || 5;
			$scope.config.neutralZoomLevel = $scope.config.neutralZoomLevel || 2;
			$scope.config.initialZoomLevel = $scope.config.initialZoomLevel || $scope.config.neutralZoomLevel;
			$scope.config.initialPanX = $scope.config.initialPanX || 0;
			$scope.config.initialPanY = $scope.config.initialPanY || 0;
			$scope.config.friction = $scope.config.friction || 10.0;
			$scope.config.haltSpeed = $scope.config.haltSpeed || 100.0;
			$scope.config.scalePerZoomLevel = $scope.config.scalePerZoomLevel || 2;
			$scope.config.zoomStepDuration = $scope.config.zoomStepDuration || 0.2;
			$scope.config.zoomStepDuration = $scope.config.zoomStepDuration || 0.2;
			$scope.config.modelChangedCallback = $scope.config.modelChangedCallback || function() {};

			$scope.base = {
					zoomLevel : $scope.config.initialZoomLevel,
					pan : {
						x : $scope.config.initialPanX,
						y : $scope.config.initialPanY
					}
			};

			$scope.model.zoomLevel = $scope.base.zoomLevel;
			$scope.model.pan = {
					x : $scope.base.pan.x,
					y : $scope.base.pan.y
			};

			// FIXME why declare these on $scope? They could be private vars
			$scope.previousPosition = undefined;
			$scope.dragging = false;
			$scope.panVelocity = undefined;
			$scope.zoomAnimation = undefined;

			// private

			var getCssScale = function(zoomLevel) {
				return Math.pow($scope.config.scalePerZoomLevel, zoomLevel - $scope.config.neutralZoomLevel);
			};

			var frameElement = $element;
			var contentElement = $element.find('.pan-zoom-contents');

			var syncModelToDOM = function() {
				if ($scope.zoomAnimation) {
					$scope.model.zoomLevel = $scope.base.zoomLevel + $scope.zoomAnimation.deltaZoomLevel * $scope.zoomAnimation.progress;
					var deltaT = $scope.zoomAnimation.translationFromZoom($scope.model.zoomLevel);
					$scope.model.pan.x = $scope.base.pan.x + deltaT.x;
					$scope.model.pan.y = $scope.base.pan.y + deltaT.y;
				} else {
					$scope.model.zoomLevel = $scope.base.zoomLevel;
					$scope.model.pan.x = $scope.base.pan.x;
					$scope.model.pan.y = $scope.base.pan.y;
				}

				var scaleString = 'scale(' + getCssScale($scope.model.zoomLevel) + ')';

				contentElement.css('transform-origin', '0 0');
				contentElement.css('ms-transform-origin', '0 0');
				contentElement.css('webkit-transform-origin', '0 0');
				contentElement.css('transform', scaleString);
				contentElement.css('ms-transform', scaleString);
				contentElement.css('webkit-transform', scaleString);
				contentElement.css('left', $scope.model.pan.x);
				contentElement.css('top', $scope.model.pan.y);
			};

			var getCenterPoint = function() {
				var center = {
					x : frameElement.width() / 2,
					y : frameElement.height() / 2
				};
				return center;
			};

			var changeZoomLevel = function(newZoomLevel, clickPoint) {
				if ($scope.zoomAnimation) {
					$scope.base.zoomLevel = $scope.model.zoomLevel;
					$scope.base.pan.x = $scope.model.pan.x;
					$scope.base.pan.y = $scope.model.pan.y;

					$scope.zoomAnimation = undefined;
				}

				newZoomLevel = Math.max(0, newZoomLevel);
				newZoomLevel = Math.min($scope.config.zoomLevels - 1, newZoomLevel);

				var deltaZoomLevel = newZoomLevel - $scope.base.zoomLevel;
				if (!deltaZoomLevel) {
					return;
				}

				var duration = $scope.config.zoomStepDuration;

				//
				// Let p be the vector to the clicked point in view coords and let p' be the same point in model coords. Let s be a scale factor
				// and let t be a translation vector. Let the transformation be defined as:
				//
				//  p' = p * s + t
				//
				// And conversely:
				//
				//  p = (1/s)(p' - t)
				//
				// Now use subscription 0 to denote the value before transform and zoom and let 1 denote the value after transform. Scale
				// changes from s0 to s1. Translation changes from t0 to t1. But keep p and p' fixed so that the view coordinate p' still
				// corresponds to the model coordinate p. This can be expressed as an equation relying upon solely upon p', s0, s1, t0, and t1:
				//
				//  (1/s0)(p - t0) = (1/s1)(p - t1)
				//
				// Every variable but t1 is known, thus it is easily isolated to:
				//
				//  t1 = p' - (s1/s0)*(p' - t0)
				//

				var pmark = clickPoint || getCenterPoint();

				var s0 = getCssScale($scope.base.zoomLevel);
				var t0 = { x : $scope.base.pan.x, y: $scope.base.pan.y };

				var translationFromZoom = function(zoomLevel) {
					var s1 = getCssScale(zoomLevel);
					var t1 = {
							x : pmark.x - (s1/s0)*(pmark.x - t0.x),
							y : pmark.y - (s1/s0)*(pmark.y - t0.y)
					};

					return {
						x : t1.x - t0.x,
						y : t1.y - t0.y
					};
				};

				// now rewind to the start of the anim and let it run its course
				$scope.zoomAnimation = {
						deltaZoomLevel : deltaZoomLevel,
						translationFromZoom : translationFromZoom,
						duration : duration,
						progress : 0.0
				};
			};
			$scope.model.changeZoomLevel = changeZoomLevel;

			var zoomIn = function(clickPoint) {
				changeZoomLevel(
						Math.floor($scope.base.zoomLevel + 1.0),
						clickPoint);
			};
			$scope.model.zoomIn = zoomIn;

			var zoomOut = function(clickPoint) {
				changeZoomLevel(
						Math.ceil($scope.base.zoomLevel - 1.0),
						clickPoint);
			};
			$scope.model.zoomOut = zoomOut;

			var getViewPosition = function(modelPosition) {
				//  p' = p * s + t
				var p = modelPosition;
				var s = getCssScale($scope.base.zoomLevel);
				var t = $scope.base.pan;

				return {
					x : p.x*s + t.x,
					y : p.y*s + t.y
				};
			};
			$scope.model.getViewPosition = getViewPosition;

			var getModelPosition = function(viewPosition) {
				//  p = (1/s)(p' - t)
				var pmark = viewPosition;
				var s = getCssScale($scope.base.zoomLevel);
				var t = $scope.base.pan;

				return {
					x : (1/s)*(pmark.x - t.x),
					y : (1/s)*(pmark.y - t.y)
				};
			};
			$scope.model.getModelPosition = getModelPosition;

			var length = function(vector2d) {
				return Math.sqrt(vector2d.x*vector2d.x + vector2d.y*vector2d.y);
			};

			var AnimationTick = function() {
				var lastTick = jQuery.now();

				return function() {
					var now = jQuery.now();
					var deltaTime = (now - lastTick) / 1000;
					lastTick = now;

					if ($scope.dragging) {
						return true; // do nothing but keep timer alive
					}

					if ($scope.zoomAnimation) {
						$scope.zoomAnimation.progress += deltaTime / $scope.zoomAnimation.duration;
						if ($scope.zoomAnimation.progress >= 1.0) {
							$scope.zoomAnimation.progress = 1.0;

							syncModelToDOM();

							$scope.base.zoomLevel = $scope.model.zoomLevel;
							$scope.base.pan.x = $scope.model.pan.x;
							$scope.base.pan.y = $scope.model.pan.y;

							$scope.zoomAnimation = undefined;

							$scope.config.modelChangedCallback($scope.model);
						}
					}

					if ($scope.panVelocity) {
						$scope.base.pan.x += $scope.panVelocity.x * deltaTime; // FIXME reintroduce
						$scope.panVelocity.x *= (1 - $scope.config.friction * deltaTime);

						$scope.base.pan.y += $scope.panVelocity.y * deltaTime;
						$scope.panVelocity.y *= (1 - $scope.config.friction * deltaTime);

						var speed = length($scope.panVelocity);

						if (speed < $scope.config.haltSpeed) {
							$scope.panVelocity = undefined;
						}

						$scope.config.modelChangedCallback($scope.model);
					}

					syncModelToDOM();

					// FIXME actually we should kill the timer when unused, i.e. when animation has stopped. We should resurrect it as needed.
					return true; // keep timer alive
				};
			};
			syncModelToDOM();
			var tick = new AnimationTick();
			jQuery.fx.timer(tick);

			// event handlers

			$scope.onDblClick = function($event) {
				var clickPoint = { x: $event.clientX - frameElement.offset().left, y: $event.clientY - frameElement.offset().top };
				zoomIn(clickPoint);
			};

			var lastMouseEventTime;
			var previousPosition;

			$scope.onMousedown = function($event) {
				previousPosition = { x: $event.pageX, y: $event.pageY };
				lastMouseEventTime = jQuery.now();
				$scope.dragging = true;
			};

			$scope.onMousemove = function($event) {
				if (!$scope.dragging) {
					return;
				}

				var now = jQuery.now();
				var timeSinceLastMouseEvent = (now - lastMouseEventTime) / 1000;
				lastMouseEventTime = now;
				var dragDelta = { x: $event.pageX - previousPosition.x, y: $event.pageY - previousPosition.y };
				$scope.base.pan.x += dragDelta.x;
				$scope.base.pan.y += dragDelta.y;

				syncModelToDOM();

				// set these for the animation slow down once drag stops
				$scope.panVelocity = {
						x : dragDelta.x / timeSinceLastMouseEvent,
						y : dragDelta.y / timeSinceLastMouseEvent
				};

				previousPosition = { x: $event.pageX, y: $event.pageY };
				$event.preventDefault();
			};

			$scope.onMouseup = function() {
				var now = jQuery.now();
				var timeSinceLastMouseEvent = (now - lastMouseEventTime) / 1000;

				if ($scope.panVelocity) {
					// apply strong initial dampening if the mouse up occured much later than
					// the last mouse move, indicating that the mouse hasn't moved recently
					// TBD experiment with this formula
					var initialMultiplier = Math.max(0, Math.pow(timeSinceLastMouseEvent + 1, -4) - 0.2);

					$scope.panVelocity.x *= initialMultiplier;
					$scope.panVelocity.y *= initialMultiplier;
				}

				$scope.dragging = false;
			};

			$scope.onMouseleave = function() {
				$scope.onMouseup(); // same behaviour
			};

			$scope.onMouseWheel = function($event, $delta, $deltaX, $deltaY) {
				$event.preventDefault();

				if ($scope.zoomAnimation) {
					return; // already zooming
				}

				var sign = $deltaY / Math.abs($deltaY);

				var clickPoint = { x: $event.clientX - frameElement.offset().left, y: $event.clientY - frameElement.offset().top };

				if (sign < 0) {
					zoomIn(clickPoint);
				} else {
					zoomOut(clickPoint);
				}
			};
		}],
		template:
			'<div class="pan-zoom-frame" ng-dblclick="onDblClick($event)" ng-mousedown="onMousedown($event)" ng-mousemove="onMousemove($event)"' +
				' ng-mouseup="onMouseup($event)" ng-mouseleave="onMouseleave($event)" msd-wheel="onMouseWheel($event, $delta, $deltaX, $deltaY)"' +
				' style="position:relative;overflow:hidden">' +
				'<div class="pan-zoom-contents" style="position:absolute;left:0px;top:0px" ng-transclude>' +
					// transcluded contents will be inserted here
				'</div>' +
			'</div>',
			replace: true
	};
});