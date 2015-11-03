/*!
 AngularJS pan/zoom v1.0.14
 @license: MIT
 Github: https://github.com/mvindahl/angular-pan-zoom
*/
angular.module('panzoom', ['monospaced.mousewheel'])
    .directive('panzoom', ['$document', 'PanZoomService',
function ($document, PanZoomService) {
            var api = {};

            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    config: '=',
                    model: '='
                },
                controller: ['$scope', '$element',
    function ($scope, $element) {
                        var frameElement = $element;
                        var panElement = $element.find('.pan-element');
                        var zoomElement = $element.find('.zoom-element');
                        var panElementDOM = panElement.get(0);
                        var zoomElementDOM = zoomElement.get(0);
                        var animationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame;

                        var $overlay;
                        var existing = $document.find('#PanZoomOverlay');
                        
                        if (existing.length === 0) {
                            $overlay = $('<div id="PanZoomOverlay" style="position: absolute;'+
            				' top: 0; left: 0; right: 0; bottom: 0; opacity: 0; display: none;"></div>');
                            $document.find('body').append($overlay);
                        } else {
                        	$overlay = existing;
                        }
                        
                        var getCssScale = function (zoomLevel) {
                            return Math.pow($scope.config.scalePerZoomLevel, zoomLevel - $scope.config.neutralZoomLevel);
                        };

                        var getZoomLevel = function (cssScale) {
                            return Math.log(cssScale) / Math.log($scope.config.scalePerZoomLevel) + $scope.config.neutralZoomLevel;
                        };

                        // initialize models. Use passed properties when available, otherwise revert to defaults
                        // NOTE: all times specified in seconds, all distances specified in pixels                        
                        $scope.config.disableZoomAnimation = $scope.config.disableZoomAnimation || false;
                        $scope.config.zoomLevels = $scope.config.zoomLevels || 5;
                        $scope.config.neutralZoomLevel = $scope.config.neutralZoomLevel || 2;
                        $scope.config.friction = $scope.config.friction || 10.0;
                        $scope.config.haltSpeed = $scope.config.haltSpeed || 100.0;
                        $scope.config.scalePerZoomLevel = $scope.config.scalePerZoomLevel || 2;
                        $scope.config.zoomStepDuration = $scope.config.zoomStepDuration || 0.2;
                        $scope.config.zoomStepDuration = $scope.config.zoomStepDuration || 0.2;
                        $scope.config.modelChangedCallback = $scope.config.modelChangedCallback || function () {};
                        $scope.config.zoomToFitZoomLevelFactor = $scope.config.zoomToFitZoomLevelFactor || 0.95;
                        $scope.config.zoomButtonIncrement = $scope.config.zoomButtonIncrement || 1.0;
                        $scope.config.useHardwareAcceleration = $scope.config.useHardwareAcceleration || false;
                        
                        $scope.config.initialZoomLevel = $scope.config.initialZoomLevel || $scope.config.neutralZoomLevel;
                        $scope.config.initialPanX = $scope.config.initialPanX || 0;
                        $scope.config.initialPanY = $scope.config.initialPanY || 0;

                        $scope.config.zoomOnDoubleClick = $scope.config.zoomOnDoubleClick !== undefined ? $scope.config.zoomOnDoubleClick : true;
                        $scope.config.zoomOnMouseWheel = $scope.config.zoomOnMouseWheel !== undefined ? $scope.config.zoomOnMouseWheel : true;
                        $scope.config.panOnClickDrag = $scope.config.panOnClickDrag !== undefined ? $scope.config.panOnClickDrag : true;

                        $scope.config.invertMouseWheel = $scope.config.invertMouseWheel || false;

                        $scope.config.chromeUseTransform = $scope.config.chromeUseTransform || false;


                        var calcZoomToFit = function (rect) {
                            // let (W, H) denote the size of the viewport
                            // let (w, h) denote the size of the rectangle to zoom to
                            // then we must CSS scale by the min of W/w and H/h in order to just fit the rectangle

                            var W = $element.width();
                            var H = $element.height();
                            var w = rect.width;
                            var h = rect.height;

                            var cssScaleExact = Math.min(W / w, H / h);
                            var zoomLevelExact = getZoomLevel(cssScaleExact);
                            var zoomLevel = zoomLevelExact * $scope.config.zoomToFitZoomLevelFactor;
                            var cssScale = getCssScale(zoomLevel);

                            return {
                                zoomLevel: zoomLevel,
                                pan: {
                                    x: -rect.x * cssScale + (W - w * cssScale) / 2,
                                    y: -rect.y * cssScale + (H - h * cssScale) / 2
                                }
                            };
                        };

                        if ($scope.config.initialZoomToFit) {
                            $scope.base = calcZoomToFit($scope.config.initialZoomToFit);
                        } else {
                            $scope.base = {
                                zoomLevel: $scope.config.initialZoomLevel,
                                pan: {
                                    x: $scope.config.initialPanX,
                                    y: $scope.config.initialPanY
                                }
                            };
                        }

                        $scope.model.zoomLevel = $scope.base.zoomLevel;
                        //Only true if panning has actually taken place, not just after mousedown
                        $scope.model.isPanning = false; 
                        $scope.model.pan = {
                            x: $scope.base.pan.x,
                            y: $scope.base.pan.y
                        };


                        // FIXME why declare these on $scope? They could be private vars
                        $scope.previousPosition = undefined;
                        $scope.dragging = false;
                        $scope.panVelocity = undefined;
                        $scope.zoomAnimation = undefined;

                        // private
                        
                        var syncModelToDOM = function () {
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

                            var scale = getCssScale($scope.model.zoomLevel);
                            
                            var scaleString = 'scale(' + scale + ')';
                            
                            if (navigator.userAgent.indexOf('Chrome') !== -1) {
                                // For Chrome, use the zoom style by default, as it doesn't handle nested SVG very well
                                // when using transform
                                if( $scope.config.chromeUseTransform ) {
                                    // IE > 9.0
                                    zoomElementDOM.style.transformOrigin = '0 0';
                                    zoomElementDOM.style.transform = scaleString;
                                } else {
                                    // http://caniuse.com/#search=zoom
                                    zoomElementDOM.style.zoom = scale;
                                }

                            } else {
                                // Special handling of IE, as it doesn't support the zoom style
                                // http://caniuse.com/#search=transform

                                // IE 9.0
                                zoomElementDOM.style.msTransformOrigin = '0 0';
                                zoomElementDOM.style.msTransform = scaleString;

                                // IE > 9.0
                                zoomElementDOM.style.transformOrigin = '0 0';
                                zoomElementDOM.style.transform = scaleString;

                                // Safari etc..
                                zoomElementDOM.style.webkitTransformOrigin = '0 0';
                                zoomElementDOM.style.webkitTransform = scaleString;
                            }

                            if ($scope.config.useHardwareAcceleration) {
                                var translate = 'translate3d(' + $scope.model.pan.x + 'px, ' + $scope.model.pan.y + 'px, 0)';
                                
                                panElementDOM.style.transform = translate;
                                panElementDOM.style.msTransform = translate;
                                panElementDOM.style.webkitTransform = translate;  
                                panElementDOM.style.mozTransform = translate;
                            } else {
                                panElementDOM.style.left = $scope.model.pan.x;
                                panElementDOM.style.top = $scope.model.pan.y;    
                            }
                            
                            
                        };

                        var getCenterPoint = function () {
                            var center = {
                                x: frameElement.width() / 2,
                                y: frameElement.height() / 2
                            };
                            return center;
                        };

                        var changeZoomLevel = function (newZoomLevel, clickPoint, duration) {
                            if ($scope.zoomAnimation) {
                                $scope.base.zoomLevel = $scope.model.zoomLevel;
                                $scope.base.pan.x = $scope.model.pan.x;
                                $scope.base.pan.y = $scope.model.pan.y;

                                $scope.zoomAnimation = undefined;
                            }

                            // keep in bounds
                            newZoomLevel = Math.max(0, newZoomLevel);
                            newZoomLevel = Math.min($scope.config.zoomLevels - 1, newZoomLevel);

                            var deltaZoomLevel = newZoomLevel - $scope.base.zoomLevel;
                            if (!deltaZoomLevel) {
                                return;
                            }

                            duration = duration || $scope.config.zoomStepDuration;

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
                            var t0 = {
                                x: $scope.base.pan.x,
                                y: $scope.base.pan.y
                            };

                            var translationFromZoom = function (zoomLevel) {
                                var s1 = getCssScale(zoomLevel);
                                var t1 = {
                                    x: pmark.x - (s1 / s0) * (pmark.x - t0.x),
                                    y: pmark.y - (s1 / s0) * (pmark.y - t0.y)
                                };

                                return {
                                    x: t1.x - t0.x,
                                    y: t1.y - t0.y
                                };
                            };

                            // now rewind to the start of the anim and let it run its course
                            
                            $scope.zoomAnimation = {
                                deltaZoomLevel: deltaZoomLevel,
                                translationFromZoom: translationFromZoom,
                                duration: duration,
                                //If zoom animation disabled set progress to finish and run normal animation loop
                                progress: $scope.config.disableZoomAnimation ? 1.0 : 0.0 
                            };

                            wakeupAnimationTick();
                        };

                        var zoomIn = function (clickPoint) {
                            changeZoomLevel(
                                $scope.base.zoomLevel + $scope.config.zoomButtonIncrement,
                                clickPoint);
                        };

                        var zoomOut = function (clickPoint) {
                            changeZoomLevel(
                                $scope.base.zoomLevel - $scope.config.zoomButtonIncrement,
                                clickPoint);
                        };

                        var getViewPosition = function (modelPosition) {
                            //  p' = p * s + t
                            var p = modelPosition;
                            var s = getCssScale($scope.base.zoomLevel);
                            var t = $scope.base.pan;

                            return {
                                x: p.x * s + t.x,
                                y: p.y * s + t.y
                            };
                        };

                        var getModelPosition = function (viewPosition) {
                            //  p = (1/s)(p' - t)
                            var pmark = viewPosition;
                            var s = getCssScale($scope.base.zoomLevel);
                            var t = $scope.base.pan;

                            return {
                                x: (1 / s) * (pmark.x - t.x),
                                y: (1 / s) * (pmark.y - t.y)
                            };
                        };

                        var zoomToFit = function (rectangle) {
                            // example rectangle: { "x": 0, "y": 100, "width": 100, "height": 100 }
                            $scope.base = calcZoomToFit(rectangle);
                            syncModelToDOM();
                        };

                        var length = function (vector2d) {
                            return Math.sqrt(vector2d.x * vector2d.x + vector2d.y * vector2d.y);
                        };

                        var scopeIsDestroyed = false;
                        var AnimationTick = function () {
                            var lastTick = null;

                            return function () {
                                var now = jQuery.now();
                                var deltaTime = lastTick ? (now - lastTick) / 1000 : 0;
                                lastTick = now;

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
                                    // prevent overshooting if delta time is large for some reason. We apply the simple solution of
                                    // slicing delta time into smaller pieces and applying each one
                                    while (deltaTime > 0) {
                                        var dTime = Math.min(0.02, deltaTime);
                                        deltaTime -= dTime;

                                        $scope.base.pan.x += $scope.panVelocity.x * dTime;
                                        $scope.panVelocity.x *= (1 - $scope.config.friction * dTime);

                                        $scope.base.pan.y += $scope.panVelocity.y * dTime;
                                        $scope.panVelocity.y *= (1 - $scope.config.friction * dTime);

                                        var speed = length($scope.panVelocity);
                                        if (speed < $scope.config.haltSpeed) {
                                            $scope.panVelocity = undefined;

                                            $scope.config.modelChangedCallback($scope.model);

                                            break;
                                        }
                                    }
                                }

                                syncModelToDOM();

                                var doneAnimating = $scope.panVelocity === undefined && $scope.zoomAnimation === undefined;
                                if (doneAnimating) {
                                    tick.isRegistered = false;
                                    lastTick = null;

                                    return false; // kill the tick for now
                                } else {
                                    if (animationFrame && !scopeIsDestroyed) {
                                        animationFrame(tick); //If we're using requestAnimationFrame reschedule 
                                    } 
                                    
                                    return !scopeIsDestroyed; // kill the tick for good if the directive goes off the page
                                }
                            };
                        };
                        syncModelToDOM();
                        var tick = new AnimationTick();
                        tick.isRegistered = false;

                        function wakeupAnimationTick() {
                            if (!tick.isRegistered) {
                                tick.isRegistered = true; // must be set before registering the timer as registration triggers an immediate tick
                                
                                if (animationFrame) {
                                    animationFrame(tick);
                                } else {
                                    jQuery.fx.timer(tick);    
                                }
                                
                            }
                        }

                        $scope.$on('$destroy', function () {
                            PanZoomService.unregisterAPI($scope.elementId);
                            scopeIsDestroyed = true;
                        });
                        // event handlers

                        $scope.onDblClick = function ($event) {
                            if ($scope.config.zoomOnDoubleClick) {
                                var clickPoint = {
                                    x: $event.pageX - frameElement.offset().left,
                                    y: $event.pageY - frameElement.offset().top
                                };
                                zoomIn(clickPoint);
                            }
                        };

                        var lastMouseEventTime;
                        var previousPosition;

                        $scope.onTouchStart = function($event) {
                            $event.preventDefault();

                            if ($event.originalEvent.touches.length === 1) {
                                // single touch, get ready for panning

                                // Touch events does not have pageX and pageY, make touchstart
                                // emulate a regular click event to re-use mousedown handler
                                $event.pageX = $event.originalEvent.touches[0].pageX;
                                $event.pageY = $event.originalEvent.touches[0].pageY;
                                $scope.onMousedown($event);
                            } else {
                                // multiple touches, get ready for zooming

                                // Calculate x and y distance between touch events
                                var x = $event.originalEvent.touches[0].pageX - $event.originalEvent.touches[1].pageX;
                                var y = $event.originalEvent.touches[0].pageY - $event.originalEvent.touches[1].pageY;

                                // Calculate length between touch points with pythagoras
                                // There is no reason to use Math.pow and Math.sqrt as we
                                // only want a relative length and not the exact one.
                                previousPosition = {
                                    length: x * x + y * y
                                };
                            }
                        };
                        
                        
                        $scope.onTouchMove = function($event) {
                        	$event.preventDefault();

                            if ($event.originalEvent.touches.length === 1) {
                                // single touch, emulate mouse move
                                $event.pageX = $event.originalEvent.touches[0].pageX;
                                $event.pageY = $event.originalEvent.touches[0].pageY;
                                $scope.onMousemove($event);
                            } else {
                                // multiple touches, zoom in/out

                                // Calculate x and y distance between touch events
                                var x = $event.originalEvent.touches[0].pageX - $event.originalEvent.touches[1].pageX;
                                var y = $event.originalEvent.touches[0].pageY - $event.originalEvent.touches[1].pageY;
                                // Calculate length between touch points with pythagoras
                                // There is no reason to use Math.pow and Math.sqrt as we
                                // only want a relative length and not the exact one.
                                var length = x * x + y * y;

                                // Calculate delta between current position and last position
                                var delta = length - previousPosition.length;

                                // Naive hysteresis
                                if (Math.abs(delta) < 100) {
                                    return;
                                }

                                // Calculate center between touch points
                                var centerX = $event.originalEvent.touches[1].pageX + x / 2;
                                var centerY = $event.originalEvent.touches[1].pageY + y / 2;

                                // Calculate zoom center
                                var clickPoint = {
                                    x: centerX - frameElement.offset().left,
                                    y: centerY - frameElement.offset().top
                                };

                                changeZoomLevel($scope.base.zoomLevel + delta * 0.0001, clickPoint);

                                // Update length for next move event
                                previousPosition = {
                                    length: length
                                };
                            }
                        };

                        $scope.onTouchEnd = function($event) {
                            $scope.onMouseup($event);
                        };

                        $scope.onMousedown = function ($event) {
                            if ($scope.config.panOnClickDrag) {
                                previousPosition = {
                                    x: $event.pageX,
                                    y: $event.pageY
                                };
                                lastMouseEventTime = jQuery.now();
                                $scope.dragging = true;
                                $scope.model.isPanning = false;
                                $document.on('mousemove', $scope.onMousemove);
                                $document.on('mouseup', $scope.onMouseup);	
                                $document.on('touchend', $scope.onTouchEnd);
                                $document.on('touchmove', $scope.onTouchMove);
                            }
                            
                            return false;
                        };
                        var pan = function (delta) {
                            delta.x = delta.x || 0;
                            delta.y = delta.y || 0;
                            $scope.base.pan.x += delta.x;
                            $scope.base.pan.y += delta.y;

                            syncModelToDOM();
                        };

                        $scope.onMousemove = function ($event) {
                    		$event.preventDefault();
                    		$event.stopPropagation();
                        	
                            var now = jQuery.now();
                            var timeSinceLastMouseEvent = (now - lastMouseEventTime) / 1000;
                            $scope.hasPanned = true;
                            lastMouseEventTime = now;
                            var dragDelta = {
                                x: $event.pageX - previousPosition.x,
                                y: $event.pageY - previousPosition.y
                            };
                            pan(dragDelta);
                            
                            if (!$scope.model.isPanning) {
                            	/*This will improve the performance, 
                            	 *because the browser stop evaluating hits against the elements displayed inside the pan zoom view.
                            	 *Besides this, mouseevents will not be send to any other elements, 
                            	 *this prevents issues like selecting elements while dragging. */
                                $overlay.css('display', 'block');
                            }
                            
                            $scope.model.isPanning = true;
                            

                            // set these for the animation slow down once drag stops
                            $scope.panVelocity = {
                                x: dragDelta.x / timeSinceLastMouseEvent,
                                y: dragDelta.y / timeSinceLastMouseEvent
                            };

                            previousPosition = {
                                x: $event.pageX,
                                y: $event.pageY
                            };
                        };

                        $scope.onMouseup = function () {
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
                            $scope.model.isPanning = false;
                            
                            wakeupAnimationTick();

                            $document.off('mousemove', $scope.onMousemove);
                            $document.off('mouseup', $scope.onMouseup);	
                            $document.off('touchend', $scope.onTouchEnd);
                            $document.off('touchmove', $scope.onTouchMove);
                            
                            //Set the overlay to noneblocking again:
                            $overlay.css('display', 'none');
                        };

                        $scope.onMouseleave = function () {
                            $scope.onMouseup(); // same behaviour
                        };

                        $scope.onMouseWheel = function ($event, $delta, $deltaX, $deltaY) {
                            if ($scope.config.zoomOnMouseWheel) {
                                $event.preventDefault();

                                if ($scope.zoomAnimation) {
                                    return; // already zooming
                                }

                                var sign = $deltaY / Math.abs($deltaY);

                                if ($scope.config.invertMouseWheel) {
                                    sign = -sign;
                                }

                                var clickPoint = {
                                    x: $event.originalEvent.pageX - frameElement.offset().left,
                                    y: $event.originalEvent.pageY - frameElement.offset().top
                                };

                                if (sign < 0) {
                                    zoomIn(clickPoint);
                                } else {
                                    zoomOut(clickPoint);
                                }
                            }
                        };
                     	
                        // create public API
                        api = {
                            model: $scope.model,
                            config: $scope.config,
                            changeZoomLevel: changeZoomLevel,
                            zoomIn: zoomIn,
                            zoomOut: zoomOut,
                            zoomToFit: zoomToFit,
                            getViewPosition: getViewPosition,
                            getModelPosition: getModelPosition
                        };

        }],
                link: function (scope, element, attrs) {
                    scope.elementId = attrs.id;

                    if (scope.elementId) {
                        PanZoomService.registerAPI(scope.elementId, api);
                    }
                    
                    element.on('touchstart', function(e) {
                    	scope.onTouchStart(e);
                    });
                },
                template: '<div class="pan-zoom-frame" ng-dblclick="onDblClick($event)" ng-mousedown="onMousedown($event)"' +
                    ' msd-wheel="onMouseWheel($event, $delta, $deltaX, $deltaY)"' +
                    ' style="position:relative;overflow:hidden;cursor:move">' +
                    '<div class="pan-element" style="position:absolute;left:0px;top:0px">' +
                    '<div class="zoom-element" ng-transclude>' +
                    '</div>' +
                    '</div>' +
                    '</div>',
                replace: true
            };
    }]);
angular.module('panzoomwidget', [])
.directive('panzoomwidget', ['$document', 'PanZoomService',
function ($document, PanZoomService) {
  var panzoomId;

  return {
    restrict: 'E',
    transclude: true,
    compile: function compile(/*tElement, tAttrs, transclude*/) {
      return {
        pre: function preLink(/*scope, iElement, iAttrs, controller*/) { },
        post: function postLink(scope, iElement, iAttrs /*, controller*/) {
          // we pick the value ourselves at this point, before the controller is instantiated,
          // instead of passing it as a scope variable. This is to not force people to type quotes
          // around the string.
          // Note: we need to use iAttrs and not directly get the attribute on the element to
          // be sure to get the interpolated value ({{foo}})
          panzoomId = iAttrs.panzoomId;

          if (!panzoomId) {
            throw 'Error in setup. You must define attribute panzoom-id on the <panzoomwidget> element in order to link it to the ' +
            'id of the <panzoom> element. Ref: ';
          }
          PanZoomService.getAPI(panzoomId).then(function (api) {
            scope.model = api.model;
            scope.config = api.config;

            var zoomSliderWidget = iElement.find('.zoom-slider-widget');
            var isDragging = false;

            var sliderWidgetTopFromZoomLevel = function (zoomLevel) {
              return ((scope.config.zoomLevels - zoomLevel - 1) * scope.widgetConfig.zoomLevelHeight);
            };

            var zoomLevelFromSliderWidgetTop = function (sliderWidgetTop) {
              return scope.config.zoomLevels - 1 - sliderWidgetTop / scope.widgetConfig.zoomLevelHeight;
            };

            var getZoomLevelForMousePoint = function ($event) {
              var sliderWidgetTop = $event.pageY - iElement.find('.zoom-slider').offset().top - scope.widgetConfig.zoomLevelHeight / 2;
              return zoomLevelFromSliderWidgetTop(sliderWidgetTop);
            };

            scope.getZoomLevels = function () {
              var zoomLevels = [];
              for (var i = scope.config.zoomLevels - 1; i >= 0; i--) {
                zoomLevels.push(i);
              }
              return zoomLevels;
            };

            scope.widgetConfig = {
              zoomLevelHeight: 10
            };

            scope.zoomIn = function () {
              api.zoomIn();
            };

            scope.zoomOut = function () {
              api.zoomOut();
            };

            scope.onClick = function ($event) {
              var zoomLevel = getZoomLevelForMousePoint($event);
              api.changeZoomLevel(zoomLevel);
            };

            scope.onMousedown = function () {
              isDragging = true;

              $document.on('mousemove', scope.onMousemove);
              $document.on('mouseup', scope.onMouseup);
            };

            scope.onMousemove = function ($event) {
              $event.preventDefault();
              var zoomLevel = getZoomLevelForMousePoint($event);
              api.changeZoomLevel(zoomLevel);
            };

            scope.onMouseup = function () {
              isDragging = false;

              $document.off('mousemove', scope.onMousemove);
              $document.off('mouseup', scope.onMouseup);
            };

            scope.onMouseleave = function () {
              isDragging = false;
            };

            // $watch is not fast enough so we set up our own polling
            setInterval(function () {
              zoomSliderWidget.css('top', sliderWidgetTopFromZoomLevel(scope.model.zoomLevel) + 'px');
            }, 25);
          });
        }
      };
    },
    template: '<div class="panzoomwidget">' +
    '<div ng-click="zoomIn()" ng-mouseenter="zoomToLevelIfDragging(config.zoomLevels - 1)" class="zoom-button zoom-button-in">+</div>' +
    '<div class="zoom-slider" ng-mousedown="onMousedown()" ' +
    'ng-click="onClick($event)">' +
    '<div class="zoom-slider-widget" ng-style="{\'height\': widgetConfig.zoomLevelHeight - 2 +\'px\'}"></div>' +
    '<div ng-repeat="zoomLevel in getZoomLevels()" ' +
    ' class="zoom-level zoom-level-{{zoomLevel}}" ng-style="{\'height\': widgetConfig.zoomLevelHeight +\'px\'}"></div>' +
    '</div>' +
    '<div ng-click="zoomOut()" ng-mouseenter="zoomToLevelIfDragging(0)" class="zoom-button zoom-button-out">-</div>' +
    '<div ng-transclude></div>' +
    '</div>',
    replace: true
  };
}]);
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
                throw 'Internal error: attempt to register a panzoom API but key was already used. Did you declare two <panzoom> directives with the same id?';
            } else {
                deferred.resolve(panZoomAPI);
                deferred.hasBeenResolved = true;
            }
        };

        var unregisterAPI = function (key) {
            delete panZoomAPIs[key];
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
            unregisterAPI: unregisterAPI,
            getAPI: getAPI
        };
}]);
