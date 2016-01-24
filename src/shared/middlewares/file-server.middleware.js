module.exports = function(server) {
    'use strict';

    var fs = require('fs');

    return function(publicFolder) {
        return function(req, res/*, next*/) {
            console.log('Serving files');

            var info = new server.helpers.httpInfo(req);
            switch (info.getHttpMethod()) {
                case 'GET':
                    var fileDescriptor = info.getFullPath(publicFolder);
                    console.log(fileDescriptor);
                    // check if a specific file was requested
                    console.log('Check for file', fileDescriptor.filename);
                    if ((fs.existsSync(fileDescriptor.fullPath))) {
                        console.log('Serving file ' + fileDescriptor.filename);
                        res.sendfile(fileDescriptor.filename, {
                            root: fileDescriptor.publicFolder
                        });
                    } else {
                        res.sendfile('index.html', {
                            root: fileDescriptor.publicFolder
                        });
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
