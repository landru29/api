'use strict';
    var cluster = require('cluster');
    var packageJson = require('./package.json');
    var _ = require('lodash');
    var fs = require('fs');


    function clusterMode(config) {
        if (cluster.isMaster) {

            var apiProcessList = [];

            _.forEach(config.launcher, function(launcher, name) {
                var forks = launcher['nb-forks'];
                console.log('Creating ' + forks + ' processes of ' + name);
                for (var i = 0; i < forks; i++) {
                    apiProcessList.push({
                        pid: cluster.fork({
                            file: launcher.script,
                            options: JSON.stringify(launcher.options)
                        }).process.pid,
                        file: name,
                        options: JSON.stringify(launcher.options)
                    });
                }
            });

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
    }

    function monoThreadMode(config) {
        var defaultProcess = _.find(config.launcher, {default:true});
        console.log('Launching mono-thread', defaultProcess.script);
        require(defaultProcess.script)(defaultProcess.options);
    }


    if (process.env.MONO_THREAD) {
        monoThreadMode(require('./config.json'));
    } else {
        clusterMode(require('./config.json'));
    }
