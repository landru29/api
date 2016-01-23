'use strict';
    var cluster = require('cluster');
    var packageJson = require('./package.json');
    var _ = require('lodash');
    var fs = require('fs');

    if (cluster.isMaster) {

        /*if (!fs.existsSync('./config.json')) {
            log.fatal('Cannot find config.json');
            process.exit(1);
        }*/
        var config = require('./config.json');

        var apiProcessList = [];
        var launcher = config.launcher;

        for (var key in launcher) {
            if (launcher.hasOwnProperty(key)) {
                var forks = launcher[key]['nb-forks'];
                console.log('Creating ' + forks + ' processes of ' + key);
                var options = launcher[key].options;
                for (var i = 0; i < forks; i++) {
                    apiProcessList.push({
                        pid: cluster.fork({
                            file: launcher[key].script,
                            options: JSON.stringify(options)
                        }).process.pid,
                        file: key,
                        options: JSON.stringify(options)
                    });
                }
            }
        }

        /**
         * Check which process died and relaunch it
         */
        var checkForRelaunch = function(processList, worker) {
            var index = _.findIndex(processList, {pid: worker.process.pid});
            if (index > -1) {
                processList[index] = {
                    file: processList[index].file,
                    options :processList[index].options,
                    pid: cluster.fork({
                        file: processList[index].file,
                        options :processList[index].options
                    })
                };
                return true;
            }
            return false;
        };

        // relaunch process if dying
        cluster.on('exit', function (worker) {
            console.error('Worker ' + worker.process.pid + ' died :(');
            checkForRelaunch(apiProcessList, worker);
        });

    } else {
        console.log('Launching', process.env.file);
        require(process.env.file)(JSON.parse(process.env.options));
    }
