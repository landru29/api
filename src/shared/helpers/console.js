module.exports = function (server) {
    'use strict';

    var chalk = require('chalk');

    var MyConsole = function(options) {
        this.options = options ? options : {};
    };

    function format(meta, data, haslog) {
        if (!haslog) {
            return ;
        }
        var d = new Date();
        var printData = [
            chalk.dim(d.toISOString() + '[' + process.pid + ']: >'),
            meta
        ];
        return console.log.apply(null, printData.concat(data));
    }

    MyConsole.prototype.log = function() {
        var args = Array.prototype.slice.call(arguments);
        return format(chalk.gray('  LOG'), args, this.options.log);
    };

    MyConsole.prototype.error = function() {
        var args = Array.prototype.slice.call(arguments);
        return format(chalk.bgRed('ERROR'), args, this.options.log);
    };

    MyConsole.prototype.info = function() {
        var args = Array.prototype.slice.call(arguments);
        return format(chalk.blue(' INFO'), args, this.options.log);
    };

    MyConsole.prototype.warn = function() {
        var args = Array.prototype.slice.call(arguments);
        return format(chalk.bgYellow(' WARN'), args, this.options.log);
    };

    return new MyConsole({
        log: !server.options.logQuiet
    });


};
