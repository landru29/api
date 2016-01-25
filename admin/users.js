#!/usr/bin/node

(function(){
    'use strict';

    var chalk = require('chalk');
    var App = require('../src/app.js');
    var application = new App({
        options: {
            logQuiet: true
        }
    });

    function display(data) {
        return JSON.stringify(data, null, 4);
    }

    application.bootstrap(function () {

        var controller = application.controllers.user;
        var args = {};

        process.argv.forEach(function (val, index, array) {
            var arg = val.split('=');
            if (arg[1]) {
                args[arg[0]] = arg[1];
            }
        });

        if (!args.action) {
            console.log(chalk.red('Missing action=insert|read|delete|update'));
        }
        var action = args.action;
        delete args.action;
        switch (action) {
            case 'insert':
                console.log(chalk.blue('Insert'), args);
                controller.createUser(args, function (err, data) {
                    if (err) {
                        console.log(chalk.red('ERROR'), err);
                    } else {
                        console.log(chalk.green('SUCCESS'), display(data));
                    }
                    application.mongoose.instance.disconnect();
                });
                break;
            case 'delete':
                console.log(chalk.blue('Delete'), args);
                controller.deleteUser(args.id, function (err) {
                    if (!err) {
                        console.log(chalk.green('SUCCESS'), 'User deleted');
                    } else {
                        console.log(chalk.red('ERROR'), err);
                    }
                    application.mongoose.instance.disconnect();
                });
                break;
            case 'recovery':
                console.log(chalk.blue('Recovery'), args);
                controller.sendRecovery(args.email, function (err, data) {
                    if (!err) {
                        console.log(chalk.green('SUCCESS'), display(data));
                    } else {
                        console.log(chalk.red('ERROR'), err);
                    }
                    application.mongoose.instance.disconnect();
                });
                break;
            case 'update':
                console.log(chalk.blue('Update'), args);
                var id = args.id;
                delete args.id;
                controller.updateUser(id, args, function (err, data) {
                    if (!err) {
                        console.log(chalk.green('SUCCESS'), 'User updated', display(data));
                    } else {
                        console.log(chalk.red('ERROR'), err);
                    }
                    application.mongoose.instance.disconnect();
                });
                break;
            case 'read':
            default:
                console.log(chalk.blue('Read'), args);
                controller.readUsers(function (err, data) {
                    if (err) {
                        console.log(chalk.red('ERROR'), err);
                    } else {
                        console.log(chalk.green('SUCCESS'), display(data));
                    }
                    application.mongoose.instance.disconnect();
                });
                break;
        }


    });

})();
