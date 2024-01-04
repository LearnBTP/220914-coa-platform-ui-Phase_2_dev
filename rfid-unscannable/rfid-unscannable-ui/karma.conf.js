module.exports = function (config) {
    config.set({
        async: true,
        frameworks: ["ui5"],

        ui5: {
            configPath: "ui5-test.yaml"
        },
        reporters: ['progress', 'coverage'],
        preprocessors: {
            'webapp/!(test|localService|utils)/**/*.js': ['coverage']
        },
        coverageReporter: { type: 'lcov', dir: 'coverage', subdir: 'reports' },
        browsers: ["ChromeHeadless"],
        pingTimeout: 900000,
        browserNoActivityTimeout: 100000
    });

    require("karma-ui5/helper").configureIframeCoverage(config);
};