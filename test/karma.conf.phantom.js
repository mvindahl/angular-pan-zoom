module.exports = function (config) {
    // apply base config
    require('./karma.conf.js')(config);

    config.set({
        browsers: ['PhantomJS'],
        autoWatch: false,
        singleRun: true,
    });
};