module.exports = function(server) {
    'use strict';

    var fs = require('fs');

    return function(publicFolder) {
        return function(req, res/*, next*/) {
            server.console.log('Serving files');

            var info = new server.helpers.httpInfo(req);
            switch (info.getHttpMethod()) {
                case 'GET':
                    var fileDescriptor = info.getFullPath(publicFolder);
                    server.console.log(fileDescriptor);
                    // check if a specific file was requested
                    server.console.log('Check for file', fileDescriptor.filename);
                    if ((fs.existsSync(fileDescriptor.fullPath))) {
                        server.console.log('Serving file ' + fileDescriptor.filename);
                        res.sendfile(fileDescriptor.filename, {
                            root: fileDescriptor.publicFolder
                        });
                    } else {
                        if ((fs.existsSync(fileDescriptor.publicFolder + '/index.html'))) {
                            res.sendfile('index.html', {
                                root: fileDescriptor.publicFolder
                            });
                        } else {
                            res.status(404).send();
                        }
                    }
                    break;
                default:
                    res.status(403).send({
                        message: 'unauthorized'
                    });
            }

        };
    };
};
