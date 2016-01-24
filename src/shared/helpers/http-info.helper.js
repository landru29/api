module.exports = function (/*server*/) {
  'use strict';
  var HttpInfo = function(req) {
    this.req = req;
  };

  HttpInfo.prototype = {
    /**
     * Get the method of the request
     * @return {string} method
     */
    getHttpMethod: function() {
      if (this.req.query.method) {
        return this.req.query.method.toUpperCase();
      } else {
        return this.req.method.toUpperCase();
      }
    },

    /**
     * Get the full path of a requested file
     * @return {string}     full path
     */
    getFullPath: function(publicFolder) {
    publicFolder = publicFolder ? '/' + publicFolder.replace(/\/$/, '').replace(/^\//, '') + '/': '';
      // delete first '/' if exists and all the string after a '?'
      var resource = this.req.url.replace(/^\//, '').replace(/[\?].*/, '');
      var filename = (resource.length > 0 ? resource : 'index.html');
      return {
          publicFolder: publicFolder,
          filename: filename,
          fullPath: publicFolder + filename
      };
    }
  };

  return HttpInfo;

};
