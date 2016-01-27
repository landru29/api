module.exports = function (server) {
    'use strict';
    var q = require('q');
    var Application = server.getModel('Application');


    /**
     * Read all applications
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readApplications(/*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return Application.find(callback);
    }

    /**
     * Get an application by ID
     * @param {String} id         Application Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readApplicationById(id /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            Application.findById(id, callback).then(
                function(data) {
                    resolve(data);
                },
                function(err) {
                    reject(err);
                }
            );
        });
    }

    /**
     * Get an application by Name
     * @param {String} name       Application Name
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readApplicationByName(name /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return Application.find({
            name: name
        }, callback);
    }

    /**
     * Create an Application
     * @param {Object}   ApplicationData Application {name}
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function createApplication(applicationData /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            var application = new Application();
            application.name = applicationData.name;
            application.redirection = applicationData.redirection;
            application.active = true;
            application.save(function (err, createdApplication) {
                if (!err) {
                    resolve({
                        _id: createdApplication._id,
                        name: createdApplication.name
                    });
                    callback(null, {
                        _id: createdApplication._id,
                        name: createdApplication.name
                    });
                } else {
                    reject(err);
                    callback(err);
                }
            });
        });
    }

    /**
     * Delete a Application
     * @param {String} id         Application Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function deleteApplication(id /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return Application.remove({
            _id: id
        }, callback);
    }

    /**
     * [[Description]]
     * @param {String} id         Application Identifier
     * @param {Object}   ApplicationData Application {name, active}
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function updateApplication(id, applicationData /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            readApplicationById(id).then(
                function(application) {
                    if (applicationData.name) {
                        application.name = applicationData.name;
                    }
                    if (applicationData.redirection) {
                        application.redirection = applicationData.redirection;
                    }
                    if (applicationData.active) {
                        application.active = applicationData.active;
                    }
                    application.save(callback).then(function (data) {
                        resolve(data);
                        callback(null, data);
                    }, function (err) {
                        reject(err);
                        callback(err);
                    });
                },
                function(err) {
                    reject(err);
                    return callback(err);
                }
            );
        });
    }


    return {
        readApplications: readApplications,
        readApplicationById: readApplicationById,
        readApplicationByName: readApplicationByName,
        createApplication: createApplication,
        deleteApplication: deleteApplication,
        updateApplication: updateApplication
    };
};
