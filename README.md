angular-pan-zoom
================

AngularJS directive for implementing pan and zoom on any DOM element

Features:
---------
- Zoom between discrete zoom levels using mouse wheel, double click, or control widget
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
Check out the project and open test.html in a browser for a demo of the functionality. [TBD: Figure out if I can include it at this spot]

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
  <panzoom config="config" model="model">
    <!-- your content here -->
  </panzoom>
  ..
  <!-- include scripts -->
  <script src="bower_components/jQuery/dist/jQuery.js"></script>
  <script src="bower_components/hamsterjs/hamster.js"></script>
  <script src="bower_components/angular/angular.min.js"></script>
  <script src="bower_components/angular-mousewheel/mousewheel.js"></script>
  <script src="scripts/directives/panzoom.js"></script>
</body>
```

This will provide zoom and pan functionality using default settings. It will, however, not provide any widget to control the zoom and pan.

### Using the provided zoom pan widget

To use the provided `<panzoomwidget>`, you need to
- include scripts/directives/panzoomwidget.js and css/panzoomwidget.css on your page
- make your AngularJS module depend upon the panzoomwidget module
- use the `<panzoomwidget>` directive in the markup, passing the same config and model that you passed to `<panzoom>`
You will probably also want to position the widget above the zoomed contents be means of CSS. Check ./test.html for a working example.

### Implementing your own external controls

Refer to panzoomwidget.js for an example of how this may be done. Whether or not you create it as a directive is up to you.
The main thing to know is that once you have passed the model object to the `<panzoom>` directive, it will contain
methods `zoomIn()` and `zoomOut()` which do pretty much what you would expect them to do.

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
You can read the current zoom and pan state at any time from this object, and you can
invoke attached methods to manipulate state.

[TBD: Document this simple API]

Minified version:
-----------------
There is a minified version in the build folder. It currently combines both of the directives. [Maybe we should provide two versions]

Contributing to the project:
----------------------------
Any code contributions to the project will be appreciated. A few guidelines follow.

Bower is used for obtaining 3rd party libraries. The libraries in bower_components are
also committed along with the project. A 1:1 correspondence between bower.json and the
contents of bower_components is expected at all times.

Gulp is used for building the minified files and for running jshint. The gulpfile.js contains
instructions for installing npm dependencies. Please commit an up-to-date minified file along with your code,
and please make sure that the code passes jshint. The rules are not overly Nazi.

[TBD: Unit tests are an obvious omission at this point]

[TBD: We also need to think in terms of versioning and releases. Currently there's just the bleeding edge version.]






