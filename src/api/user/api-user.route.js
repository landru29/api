module.exports = function(server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var controller = server.controllers.user;

    /**
     * Read All users
     * @name /
     * @method GET
     * @role admin
     */
    router.get('/', function (req, res) {
        controller.readUsers(function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    /**
     * Read one user
     * @name /:id
     * @method GET
     * @param {String} id @url @required User ID
     * @role admin
     */
    router.get('/:id', function(req, res) {
        controller.readUserById(req.params.id, function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    /**
     * Create a user
     * @name /
     * @method POST
     * @param {String} name     @body            User name
     * @param {String} email    @body @required User email
     * @param {String} password @body @required User password
     * @role admin
     */
    router.post('/', function(req, res) {
        controller.createUser(req.body, function(err, data) {
            server.helpers.response(req, res, err, data, {message: {success: 'User created'}});
        });
    });

    /**
     * Delete a user
     * @name /:id
     * @method DELETE
     * @param {String} id @url @required User ID
     * @role admin
     */
    router.delete('/:id', function (req, res) {
        controller.deleteUser(req.params.id, function(err) {
            server.helpers.response(req, res, err, null, {message: {success: 'User deleted'}});
        });
    });

    /**
     * Update a user
     * @name /:id
     * @method PUT
     * @param {String} id       @url  @required User ID
     * @param {String} name     @body            User name
     * @param {String} addAppId @body            Add an application
     * @param {String} delAppId @body            Delete an application
     * @role admin
     */
    router.put('/:id', function (req, res) {
        controller.updateUser(req.params.id, {
            name: req.body.name,
            addAppId: req.body.addAppId,
            delAppId: req.body.delAppId
        }, function(err, data) {
            server.helpers.response(req, res, err, data, {message: {success: 'User updated'}});
        });
    });

    return router;
};
