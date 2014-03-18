module.exports = function(config) {
	config.set({
		basePath : '../',

		autoWatch : true,
		singleRun: false,
		exclude : [],

		frameworks : [ 'jasmine' ],

		browsers : [ 'Chrome' ], //[ 'PhantomJS', 'Chrome', 'Firefox', 'Safari'],

		plugins : [ 'karma-junit-reporter', 'karma-chrome-launcher',
				'karma-firefox-launcher', 'karma-jasmine', 'karma-coverage', 'karma-phantomjs-launcher' ],
		junitReporter : {
			outputFile : 'test_out/unit.xml',
			suite : 'unit'
		}
	});
};