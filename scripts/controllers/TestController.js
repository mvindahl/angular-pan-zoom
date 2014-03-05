/*global angular:false */

angular.module('test', ['panzoom', 'panzoomwidget'])

.controller('TestController', ['$scope',
                               function($scope) {
	// Instatiate models which will be passed to <panzoom> and <panzoomwidget>

	// The panzoom config model can be used to override default configuration values
	$scope.panzoomConfig = {};

	// The panzoom model should initialle be empty; it is initialized by the <panzoom>
	// directive. It can be used to read the current state of pan and zoom. Also, it will
	// contain methods for manipulating this state.
	$scope.panzoomModel = {};
}
]);
