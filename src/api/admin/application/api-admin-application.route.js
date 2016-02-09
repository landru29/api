module.exports = function(server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var controller = server.controllers.application;


    /**
     * Read All applications
     * @name /
     * @method GET
     * @role admin
     */
    router.get('/', function (req, res) {
        controller.readApplications(function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    /**
     * Read one application
     * @name /:id
     * @method GET
     * @param {String} id @url @required Application ID
     * @role admin
     */
    router.get('/:id', function(req, res) {
        controller.readApplicationById(req.params.id, function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    /** Create an application
     * @name /
     * @method POST
     * @param {String} name        @body @required Application name
     * @param {String} redirection @body @required Redirection url
     * @role admin
     */
    router.post('/', function(req, res) {
        controller.createApplication(req.body, function(err, data) {
            server.helpers.response(req, res, err, data, {message: {success: 'Application created'}});
        });
    });

    /**
     * Delete an application
     * @name /:id
     * @method DELETE
     * @param {String} id @url @required Application ID
     * @role admin
     */
    router.delete('/:id', function (req, res) {
        controller.deleteApplication(req.params.id, function(err) {
            server.helpers.response(req, res, err, null, {message: {success: 'Application deleted'}});
        });
    });

    /**
     * Update an application
     * @name /:id
     * @method PUT
     * @param {String}  id          @url  @required  Application ID
     * @param {String}  name        @body            Application name
     * @param {String}  redirection @body            Redirection url
     * @param {Boolean} active      @body            Enable application
     * @role admin
     */
    router.put('/:id', function (req, res) {
        controller.updateApplication(req.params.id, {
            name: req.body.name
        }, function(err, data) {
            server.helpers.response(req, res, err, data, {message: {success: 'Application updated'}});
        });
    });

    return router;
};
