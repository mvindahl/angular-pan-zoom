module.exports = function(config) {
	// apply base config
	require('./karma.conf.js')(config);

	config.set({
		browsers : [ 'PhantomJS' ],
		autoWatch : false,
		singleRun : true,
		preprocessors : {
			'scripts/directives/*.js' : 'coverage'
		},
		coverageReporter : {
			type : 'html',
			dir : 'target/coverage'
		},
		junitReporter : {
			outputFile : 'target/test-results.xml',
			suite : ''
		},
		reporters : [ 'progress', 'junit', 'coverage' ]
	});
};