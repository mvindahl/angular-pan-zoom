module.exports = function (config) {
    config.set({
        basePath: '../',

        autoWatch: true,
        singleRun: false,
        exclude: [],

        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'bower_components/jQuery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/hamsterjs/hamster.js',
            'bower_components/angular-mousewheel/mousewheel.js',
            'scripts/directives/*.js',
            'test/unit/*.js'
        ],

        browsers: ['Chrome'], //[ 'PhantomJS', 'Chrome', 'Firefox', 'Safari'],

        plugins: ['karma-junit-reporter', 'karma-chrome-launcher',
    'karma-firefox-launcher', 'karma-jasmine', 'karma-coverage', 'karma-phantomjs-launcher'],
        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }
    });
};