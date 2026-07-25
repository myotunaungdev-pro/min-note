const webpack = require('webpack');

module.exports = function override(config, env) {
    // Suppress the "Critical dependency: the request of a dependency is an expression"
    // warning originating from react-datepicker / date-fns dynamic imports.
    config.ignoreWarnings = [
        {
            module: /react-datepicker/,
            message: /Critical dependency: the request of a dependency is an expression/
        }
    ];

    return config;
};
