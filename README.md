

angular-pan-zoom
================

AngularJS directive for implementing pan and zoom on any DOM element

[![Build Status](https://travis-ci.org/mvindahl/angular-pan-zoom.svg?branch=master)](https://travis-ci.org/mvindahl/angular-pan-zoom)

NOTE: Migration from 0.9.0 to 1.0.0
-----------------------------------
The 1.0.0 release introduced a breaking change in how the panzoom widget publishes its API. Migration guide [here](https://github.com/mvindahl/angular-pan-zoom/wiki/Migrating-from-0.9.0-to-1.0.0)

Getting it:
-----------
Get the code from github. Or simpler yet, use bower:
```
bower install angular-pan-zoom
```

Features:
---------
- Zoom using mouse wheel, double click, or control widget
- Pan using click and drag. When releasing mouse button while panning, the pan will come to a gradual stop.
- AngularJS integrated. Models are used as APIs for communicating
- Widget with zoom controls provided. Use this or design your own controls if you so prefer.

Requirements:
-------------
- AngularJS (obviously)
- jQuery (used for managing timing loops)
- Hamster.JS (for mouse wheel support)
- angular-mousewheel (which integrates HamsterJS with angular)

For convenience, these requirements are checked in as part of the project. They are also described by the bower.json file.

Demo:
-----
Click [here](http://htmlpreview.github.io/?http://rawgithub.com/mvindahl/angular-pan-zoom/master/demo/demo.dev.html) for an online demo of
the functionality.

Usage:
------
### Simplest working example

When declaring your module:
```
angular.module('your_module', ['panzoom', ..])
```

In your controller:
```
$scope.config = {}; // use defaults
$scope.model = {}; // always pass empty object
```

In your markup:
```
<body>
  ..
  <!-- create panzoom, passing models from controller -->
  <panzoom config="config" model="model" style="width:800px; height: 600px">
    <!-- your content here -->
  </panzoom>
  ..
  <!-- include scripts -->
  <script src="bower_components/jQuery/dist/jQuery.js"></script>
  <script src="bower_components/hamsterjs/hamster.js"></script>
  <script src="bower_components/angular/angular.min.js"></script>
  <script src="bower_components/angular-mousewheel/mousewheel.js"></script>
  <script src="release/panzoom.js"></script>
</body>
```

This will provide zoom and pan functionality using default settings. It will, however, not provide any widget to control the zoom and pan.

### Using the provided zoom pan widget

To use the bundled `<panzoomwidget>`, you need to
- include release/panzoomwidget.css on your page
- make your AngularJS module depend upon the panzoomwidget module
- declare an `id` attribute on your `<panzoom>` tag
- use a `<panzoomwidget>` directive in the markup, specifying its `panzoom-id` attribute to be the same value as the `id` of the `<panzoom>` tag
You will probably also want to position the widget above the zoomed contents be means of CSS. Check ./test.html for a working example.

### Implementing your own external controls

Refer to panzoomwidget.js for an example of how this may be done. Whether or not you create it as a directive is up to you. To access
the API of a panzoom directive, you need to look it up using the `getAPI()` method on the bundled `PanZoomService`, passing the id of the
`<panzoom>` widget. The method will return a promise.

Example usage:
```
// assuming the PanZoomService to be a dependency and panzoomId to be the ID of the <panzoom> directive ...
PanZoomService.getAPI(panzoomId).then(function (api) {
    // you can now invoke the api
}
```

The API
-------
The API object contains the following properties:

Method                           | Description
-------------------------------- | -----------
`model`                          | the model object which was passed to the panzoom directive
`config`                         | the config object which was passed to the panzoom directive
`changeZoomLevel(newZoomLevel [,clickPoint])`              | change zoom level to a new value using a quick animation
`zoomIn()`                       | shorthand for increasing zoom level by one
`zoomOut()`                      | shorthand for decreasing zoom level by one
`zoomToFit(rectangle)`           | zoom to display a part of the contents. Example rectangle: { "x": 0, "y": 100, "width": 100, "height": 100 }
`getViewPosition(modelPosition)` | takes a argument a {x:.., y:..} in the original, untransformed contents. Returns the current pixel position of this point.
`getModelPosition(viewPosition)` | the reverse operation of getViewPosition()


The config object:
------------------
May be used to pass configuration options to the panzoom directive. The directive will fill
in any "blanks" with default values.

For a list of configuration keys and values you may inspect the object one you get it back.

The config object is not intended to be modified once initialized.

[TBD: List options and explanations here]


The model object:
-----------------
When initializing, you should pass an empty object. The directive will initialize the object.
You can read the current zoom and pan state at any time from this object.


Contributing to the project:
----------------------------
Any code contributions to the project will be appreciated. A few guidelines follow.

Npm is used for building stuff. Use `npm install` to fetch dependencies (including the bower ones). Use `npm start` to launch a development server using browsersync. Use 'npm run build' to perform a build as verified by uni tests and lint.
For the complete list of npm scripts, see package.json.
